import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyAuthenticationResponse } from 'https://esm.sh/@simplewebauthn/server@9.0.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const rpID = Deno.env.get('RP_ID') || 'localhost'

serve(async (req) => {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
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

    // Obtener credenciales biométricas activas del usuario
    const { data: credentials, error: credsError } = await supabase
      .from('credenciales_biometricas')
      .select('*')
      .eq('id_usuario', userData.id)
      .eq('activa', true)

    if (credsError) {
      return new Response(
        JSON.stringify({ error: 'Error de base de datos' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No hay credenciales biométricas para este usuario' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generar opciones de autenticación
    const authOptions = {
      challenge: crypto.getRandomValues(new Uint8Array(32)).reduce((a, b) => a + b.toString(16).padStart(2, '0'), ''),
      allowCredentials: credentials.map(cred => ({
        id: cred.id_credencial,
        type: 'public-key' as const,
        transports: cred.transportes ? cred.transportes : ['usb', 'nfc', 'ble', 'internal']
      })),
      userVerification: 'required',
      rpID
    }

    // Guardar desafío
    const { error: challengeError } = await supabase
      .from('desafios_autenticacion')
      .upsert({
        id_usuario: userData.id,
        desafio: authOptions.challenge,
        tipo: 'autenticacion' as const,
        expira_en: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      })

    if (challengeError) {
      return new Response(
        JSON.stringify({ error: 'Fallo al guardar desafío' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        publicKeyCredentialRequestOptions: {
          ...authOptions,
          challenge: authOptions.challenge
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error opciones auth:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
