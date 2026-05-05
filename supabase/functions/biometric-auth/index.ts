import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // email es opcional — si no se pasa, se devuelven allowCredentials vacío
    // y el dispositivo usa sus propias passkeys (resident keys)
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body.email?.toLowerCase().trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let allowCredentials: any[] = [];
    let userId: string | null = null;

    if (email) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id")
        .eq("email", email)
        .eq("role", "admin")
        .single();

      if (perfil) {
        userId = perfil.id;
        const { data: creds } = await supabase
          .from("credenciales_biometricas")
          .select("id_credencial, transportes")
          .eq("id_usuario", perfil.id)
          .eq("activa", true);

        allowCredentials = (creds || []).map((c) => ({
          id: c.id_credencial,
          type: "public-key",
          transports: c.transportes || ["internal"],
        }));
      }
    }

    // Generar challenge
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const challengeB64 = btoa(String.fromCharCode(...challenge));

    // Guardar challenge — si no hay userId usamos un placeholder temporal
    const tempUserId = userId || "00000000-0000-0000-0000-000000000000";
    if (userId) {
      await supabase.from("desafios_autenticacion").insert({
        id_usuario: tempUserId,
        desafio: challengeB64,
        tipo: "autenticacion",
        expira_en: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      });
    }

    const options = {
      challenge: challengeB64,
      rpId: new URL(req.headers.get("origin") || "http://localhost").hostname,
      allowCredentials,
      userVerification: "required",
      timeout: 60000,
    };

    return new Response(
      JSON.stringify({ publicKeyCredentialRequestOptions: options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
