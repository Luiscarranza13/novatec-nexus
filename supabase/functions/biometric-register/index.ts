import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers: corsHeaders });

    const { userName } = await req.json().catch(() => ({}));

    // Un solo cliente con service role — puede verificar el JWT del usuario
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verificar JWT del usuario usando getUser con el token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido", detail: userError?.message }), { status: 401, headers: corsHeaders });
    }

    // Verificar admin
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Sin permisos de admin" }), { status: 403, headers: corsHeaders });

    // Credenciales existentes para excluir
    const { data: existingCreds } = await supabase
      .from("credenciales_biometricas")
      .select("id_credencial")
      .eq("id_usuario", user.id)
      .eq("activa", true);

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const challengeB64 = btoa(String.fromCharCode(...challenge));

    const { error: insertError } = await supabase.from("desafios_autenticacion").insert({
      id_usuario: user.id,
      desafio: challengeB64,
      tipo: "registro",
      expira_en: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Error guardando challenge", detail: insertError.message }), { status: 500, headers: corsHeaders });
    }

    const userIdB64 = btoa(String.fromCharCode(...new TextEncoder().encode(user.id)));
    const origin = req.headers.get("origin") || "http://localhost:8080";

    const options = {
      challenge: challengeB64,
      rp: { name: "Novatec Admin", id: new URL(origin).hostname },
      user: {
        id: userIdB64,
        name: user.email,
        displayName: userName || user.email?.split("@")[0] || "admin",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required",
      },
      timeout: 60000,
      attestation: "none",
      excludeCredentials: (existingCreds || []).map((c: any) => ({
        id: c.id_credencial,
        type: "public-key",
        transports: ["internal"],
      })),
    };

    return new Response(
      JSON.stringify({ publicKeyCredentialCreationOptions: options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
