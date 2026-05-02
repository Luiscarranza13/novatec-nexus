import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import avatarLuis from "@/assets/avatar-luis.jpg";

const TECH = ["Next.js", "TanStack Start", "React", "Vue", "Supabase", "PHP", "MySQL", "Node.js", "TypeScript", "Tailwind"];

export const Route = createFileRoute("/sobre-mi")({
  head: () => ({
    meta: [
      { title: "Sobre mí · Luis Carranza" },
      { name: "description", content: "Conoce a Luis Armando Carranza Cortez, Desarrollador Full Stack y CEO de Novatec." },
    ],
  }),
  component: SobreMi,
});

type Perfil = { nombre: string; rol: string; bio: string; avatar_url: string | null };

function SobreMi() {
  const [p, setP] = useState<Perfil | null>(null);
  useEffect(() => {
    supabase.from("perfiles").select("nombre,rol,bio,avatar_url").limit(1).maybeSingle()
      .then(({ data }) => setP(data as Perfil | null));
  }, []);

  const img = p?.avatar_url || avatarLuis;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-[280px_1fr] gap-10 items-start">
        <div className="relative mx-auto md:mx-0">
          <div className="absolute -inset-4 bg-gradient-to-tr from-neon/40 to-violet/40 blur-2xl rounded-full" />
          <img
            src={img}
            alt={p?.nombre ?? "Luis Carranza"}
            className="relative h-64 w-64 object-cover rounded-3xl glass p-1.5"
            loading="lazy"
            width={768}
            height={768}
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-neon">Sobre mí</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            {p?.nombre ?? "Luis Armando Carranza Cortez"}
          </h1>
          <p className="text-muted-foreground mt-2">{p?.rol}</p>
          <p className="mt-6 text-foreground/90 leading-relaxed">{p?.bio}</p>

          <h2 className="mt-10 font-display font-semibold text-lg">Tecnologías</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {TECH.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full glass text-xs hover:text-neon hover:border-neon transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
