import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateRegistrationOptions, verifyRegistrationResponse } from 'https://esm.sh/@simplewebauthn/server@9.0.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const rpID = Deno.env.get('RP_ID') || 'localhost'
const rpName = 'Novatec Admin Panel'

serve(async (req) => {
  try {
    const { email, userName } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar que el usuario existe y es admin
    const { data: userData, error: userError } = await supabase
      .from('perfiles')
      .select('id, role')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Solo usuarios admin pueden registrar autenticación biométrica' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar si el usuario ya tiene credenciales biométricas
    const { data: existingCreds, error: credsError } = await supabase
      .from('credenciales_biometricas')
      .select('id')
      .eq('id_usuario', userData.id)
      .eq('activa', true)

    if (credsError) {
      return new Response(
        JSON.stringify({ error: 'Error de BD verificando credenciales existentes' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (existingCreds && existingCreds.length > 0) {
      return new Response(
        JSON.stringify({ error: 'El usuario ya tiene credenciales biométricas registradas' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const excludeCredentials = (existingCreds || []).map((cred: any) => ({
      id: cred.id_credencial,
      type: 'public-key' as const,
      transports: ['usb', 'nfc', 'ble', 'internal']
    }))

    const registrationOptions = generateRegistrationOptions({
      rpName,
      rpID,
      userID: userData.id,
      userName: email.toLowerCase().trim(),
      attestationType: 'direct',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
        authenticatorAttachment: 'platform'
      }
    })

    // Guardar desafío temporalmente
    const { error: challengeError } = await supabase
      .from('desafios_autenticacion')
      .upsert({
        id_usuario: userData.id,
        desafio: registrationOptions.challenge,
        tipo: 'registro' as const,
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
        publicKeyCredentialCreationOptions: registrationOptions,
        userId: userData.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error registro biométrico:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})


    // Store challenge temporarily
    const { error: challengeError } = await supabase
      .from('auth_challenges')
      .upsert({
        user_id: userData.id,
        challenge: registrationOptions.challenge,
        type: 'registration',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      })

    if (challengeError) {
      return new Response(
        JSON.stringify({ error: 'Failed to store challenge' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        publicKeyCredentialCreationOptions: registrationOptions,
        userId: userData.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
