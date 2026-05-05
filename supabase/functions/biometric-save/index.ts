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

    const { credential } = await req.json();
    if (!credential) return new Response(JSON.stringify({ error: "Credencial requerida" }), { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) return new Response(JSON.stringify({ error: "Token inválido" }), { status: 401, headers: corsHeaders });

    // Verificar challenge vigente
    const { data: desafio } = await supabase
      .from("desafios_autenticacion")
      .select("id")
      .eq("id_usuario", user.id)
      .eq("tipo", "registro")
      .gt("expira_en", new Date().toISOString())
      .order("creado_en", { ascending: false })
      .limit(1)
      .single();

    if (!desafio) return new Response(JSON.stringify({ error: "Challenge expirado" }), { status: 400, headers: corsHeaders });

    const transports: string[] = credential.response?.transports || [];
    const deviceType = transports.includes("internal") ? "platform" : "cross-platform";

    const { error: saveError } = await supabase.from("credenciales_biometricas").insert({
      id_usuario: user.id,
      correo_usuario: user.email,
      id_credencial: credential.id,
      clave_publica: JSON.stringify(credential),
      transportes: transports,
      tipo_dispositivo: deviceType,
      activa: true,
    });

    if (saveError) {
      if (saveError.code === "23505") return new Response(JSON.stringify({ error: "Credencial ya registrada" }), { status: 409, headers: corsHeaders });
      return new Response(JSON.stringify({ error: saveError.message }), { status: 500, headers: corsHeaders });
    }

    await supabase.from("desafios_autenticacion").delete().eq("id", desafio.id);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
