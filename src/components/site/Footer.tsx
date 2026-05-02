import { Instagram, Facebook, Linkedin, Github, Globe } from "lucide-react";
import { SITE } from "@/lib/site";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Perfil = {
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  github: string | null;
};

export function Footer() {
  const [p, setP] = useState<Perfil | null>(null);

  useEffect(() => {
    supabase
      .from("perfiles")
      .select("instagram,facebook,linkedin,github")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setP(data as Perfil | null));
  }, []);

  const socials = [
    { url: p?.instagram, icon: Instagram, label: "Instagram" },
    { url: p?.facebook, icon: Facebook, label: "Facebook" },
    { url: p?.linkedin, icon: Linkedin, label: "LinkedIn" },
    { url: p?.github, icon: Github, label: "GitHub" },
  ].filter((s) => s.url);

  return (
    <footer className="mt-32 border-t border-glass-border">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg">
            <span className="text-gradient">Novatec</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Construyendo el futuro digital con sistemas inteligentes, modernos y escalables.
          </p>
        </div>

        <div className="text-sm">
          <p className="text-muted-foreground">Visita</p>
          <a
            href={SITE.empresaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-foreground hover:text-neon transition-colors"
          >
            <Globe className="h-4 w-4" />
            www.novatec.ink
          </a>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Síguenos</p>
          <div className="flex gap-2 mt-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.url!}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:text-neon hover:glow-neon transition-all"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-glass-border">
        <div className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} Novatec. Todos los derechos reservados.</span>
          <span>Hecho con ❤ por {SITE.nombre}</span>
        </div>
      </div>
    </footer>
  );
}
