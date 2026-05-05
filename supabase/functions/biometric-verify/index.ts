import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { credential } = await req.json();
    if (!credential?.id) return new Response(JSON.stringify({ error: "Credencial requerida" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar credencial por id
    const { data: cred, error: credError } = await supabase
      .from("credenciales_biometricas")
      .select("id, id_usuario, contador_firmas, correo_usuario")
      .eq("id_credencial", credential.id)
      .eq("activa", true)
      .single();

    if (credError || !cred) return new Response(JSON.stringify({ error: "Credencial no encontrada" }), { status: 404, headers: corsHeaders });

    // Verificar que es admin
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: cred.id_usuario,
      _role: "admin",
    });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Sin permisos de admin" }), { status: 403, headers: corsHeaders });

    // Verificar challenge
    const clientDataJSON = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(atob(credential.response.clientDataJSON), (c) => c.charCodeAt(0)))
    );

    if (clientDataJSON.type !== "webauthn.get") return new Response(JSON.stringify({ error: "Tipo inválido" }), { status: 400, headers: corsHeaders });

    const { data: desafio } = await supabase
      .from("desafios_autenticacion")
      .select("id")
      .eq("id_usuario", cred.id_usuario)
      .eq("tipo", "autenticacion")
      .eq("desafio", clientDataJSON.challenge)
      .gt("expira_en", new Date().toISOString())
      .single();

    if (!desafio) return new Response(JSON.stringify({ error: "Challenge inválido o expirado" }), { status: 400, headers: corsHeaders });

    // Actualizar uso
    await supabase.from("credenciales_biometricas")
      .update({ contador_firmas: cred.contador_firmas + 1, ultimo_uso: new Date().toISOString() })
      .eq("id", cred.id);

    await supabase.from("desafios_autenticacion").delete().eq("id", desafio.id);

    // Obtener email del usuario desde auth
    const { data: { user } } = await supabase.auth.admin.getUserById(cred.id_usuario);
    if (!user?.email) return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404, headers: corsHeaders });

    // Generar magic link para crear sesión
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: user.email,
    });

    if (linkError || !linkData) return new Response(JSON.stringify({ error: "No se pudo generar sesión" }), { status: 500, headers: corsHeaders });

    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get("token") || linkData.properties.hashed_token;

    return new Response(
      JSON.stringify({ success: true, token, email: user.email }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
