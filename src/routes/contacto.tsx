import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MessageCircle, Send, Mail, Instagram, Facebook, Linkedin, Github } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto · Luis Carranza" },
      { name: "description", content: "Contáctame por formulario, WhatsApp o redes sociales." },
    ],
  }),
  component: Contacto,
});

const schema = z.object({
  nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(100),
  correo: z.string().trim().email("Correo inválido").max(255),
  mensaje: z.string().trim().min(5, "Mínimo 5 caracteres").max(2000),
});

type Perfil = {
  whatsapp: string | null; email_publico: string | null;
  instagram: string | null; facebook: string | null;
  linkedin: string | null; github: string | null;
};

function Contacto() {
  const [form, setForm] = useState({ nombre: "", correo: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    supabase.from("perfiles")
      .select("whatsapp,email_publico,instagram,facebook,linkedin,github")
      .limit(1).maybeSingle()
      .then(({ data }) => setPerfil(data as Perfil | null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("mensajes").insert(result.data);
    setLoading(false);
    if (error) {
      toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
      return;
    }
    toast.success("¡Mensaje enviado! Te responderé pronto.");
    setForm({ nombre: "", correo: "", mensaje: "" });
  }

  const wa = perfil?.whatsapp
    ? `https://wa.me/${perfil.whatsapp.replace(/\D/g, "")}`
    : null;

  const socials = [
    { url: perfil?.instagram, icon: Instagram, label: "Instagram" },
    { url: perfil?.facebook, icon: Facebook, label: "Facebook" },
    { url: perfil?.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: perfil?.github, icon: Github, label: "GitHub" },
  ].filter((s) => s.url);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-neon">Hablemos</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            <span className="text-gradient">Contáctame</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md">
            Cuéntame sobre tu proyecto. Te respondo en menos de 24 horas.
          </p>

          <div className="mt-8 space-y-3">
            {wa && (
              <a
                href={wa}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-3 glass rounded-xl p-4 hover:border-neon transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-neon" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">{perfil?.whatsapp}</p>
                </div>
              </a>
            )}
            {perfil?.email_publico && (
              <a
                href={`mailto:${perfil.email_publico}`}
                className="flex items-center gap-3 glass rounded-xl p-4 hover:border-neon transition-colors"
              >
                <Mail className="h-5 w-5 text-neon" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{perfil.email_publico}</p>
                </div>
              </a>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url!}
                  target="_blank" rel="noreferrer"
                  aria-label={s.label}
                  className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:text-neon hover:glow-neon transition-all"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-glass-border focus:border-neon focus:outline-none transition-colors"
              placeholder="Tu nombre"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Correo</label>
            <input
              type="email"
              value={form.correo}
              onChange={(e) => setForm((f) => ({ ...f, correo: e.target.value }))}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-glass-border focus:border-neon focus:outline-none transition-colors"
              placeholder="tu@correo.com"
              maxLength={255}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mensaje</label>
            <textarea
              value={form.mensaje}
              onChange={(e) => setForm((f) => ({ ...f, mensaje: e.target.value }))}
              rows={5}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-glass-border focus:border-neon focus:outline-none transition-colors resize-none"
              placeholder="Cuéntame sobre tu proyecto..."
              maxLength={2000}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium hover:opacity-90 transition-all disabled:opacity-60 glow-neon"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </section>
    </PublicLayout>
  );
}
