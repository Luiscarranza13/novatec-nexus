import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyAuthenticationResponse } from 'https://esm.sh/@simplewebauthn/server@9.0.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const rpID = Deno.env.get('RP_ID') || 'localhost'

serve(async (req) => {
  try {
    const { email, credential } = await req.json()

    if (!email || !credential) {
      return new Response(
        JSON.stringify({ error: 'Email y credencial son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener usuario
    const { data: userData, error: userError } = await supabase
      .from('perfiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener último desafío
    const { data: challengeData, error: challengeError } = await supabase
      .from('desafios_autenticacion')
      .select('desafio')
      .eq('id_usuario', userData.id)
      .eq('tipo', 'autenticacion')
      .gte('expira_en', new Date().toISOString())
      .order('creado_en', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (challengeError || !challengeData) {
      return new Response(
        JSON.stringify({ error: 'Desafío inválido o expirado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Obtener credencial del usuario
    const { data: dbCredential, error: credError } = await supabase
      .from('credenciales_biometricas')
      .select('*')
      .eq('id_credencial', credential.id)
      .eq('id_usuario', userData.id)
      .eq('activa', true)
      .maybeSingle()

    if (credError || !dbCredential) {
      return new Response(
        JSON.stringify({ error: 'Credencial no encontrada o desactivada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let verification
    try {
      verification = await verifyAuthenticationResponse({
        credential: {
          ...credential,
          rawId: Buffer.from(credential.rawId, 'base64').toString('base64'),
          response: {
            ...credential.response,
            authenticatorData: Buffer.from(credential.response.authenticatorData, 'base64').toString('base64'),
            clientDataJSON: Buffer.from(credential.response.clientDataJSON, 'base64').toString('base64'),
            signature: Buffer.from(credential.response.signature, 'base64').toString('base64'),
            ...(credential.response.userHandle && {
              userHandle: Buffer.from(credential.response.userHandle, 'base64').toString('base64')
            })
          }
        },
        expectedChallenge: challengeData.desafio,
        expectedOrigin: `https://${rpID}`,
        expectedRPID: rpID,
        requireUserVerification: true
      })
    } catch (error) {
      console.error('Error verificación:', error)
      return new Response(
        JSON.stringify({ error: 'Verificación fallida', details: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!verification.verified) {
      return new Response(
        JSON.stringify({ error: 'Autenticación no verificada' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Actualizar contador de la credencial
    const { error: updateError } = await supabase
      .from('credenciales_biometricas')
      .update({ 
        contador_firmas: verification.authenticationInfo.newCounter,
        ultimo_uso: new Date().toISOString()
      })
      .eq('id', dbCredential.id)

    if (updateError) {
      console.error('Fallo actualizar contador:', updateError)
    }

    // Generar token temporal para sesión
    const tempToken = Math.random().toString(36).substring(2) + Date.now().toString(36)

    // Limpiar desafío usado
    await supabase
      .from('desafios_autenticacion')
      .delete()
      .eq('id_usuario', userData.id)
      .eq('tipo', 'autenticacion')

    return new Response(
      JSON.stringify({ 
        success: true,
        tempToken,
        message: 'Autenticación exitosa'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error verificación:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
