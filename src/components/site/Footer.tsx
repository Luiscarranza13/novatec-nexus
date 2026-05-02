import { Instagram, Facebook, Linkedin, Github, Globe } from "lucide-react";
import { SITE } from "@/lib/site";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import novatecLogo from "@/assets/novatec-logo.png";
import { ADMIN_PROFILE_FILTER, pickPublicProfile } from "@/lib/profile";

type Perfil = {
  avatar_url: string | null;
  nombre: string | null;
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
      .select("nombre,avatar_url,instagram,facebook,linkedin,github")
      .eq(ADMIN_PROFILE_FILTER.column, ADMIN_PROFILE_FILTER.value)
      .order("actualizado_en", { ascending: false })
      .limit(10)
      .then(({ data }) => setP(pickPublicProfile(data as Perfil[] | null)));
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
          <div className="flex items-center gap-3">
            <img
              src={novatecLogo}
              alt="Logo Novatec"
              className="h-11 w-11 rounded-xl object-cover bg-white ring-1 ring-glass-border"
              width={44}
              height={44}
            />
            <h3 className="font-display text-lg">
              <span className="text-gradient">Novatec</span>
            </h3>
          </div>
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
          <p className="text-sm text-muted-foreground">Siguenos</p>
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
          <span>Hecho por {SITE.nombre}</span>
        </div>
      </div>
    </footer>
  );
}
