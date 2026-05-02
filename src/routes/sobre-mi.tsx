import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import avatarLuis from "@/assets/avatar-luis.jpg";
import { SITE } from "@/lib/site";
import { seo } from "@/lib/seo";
import { ADMIN_PROFILE_FILTER, pickPublicProfile } from "@/lib/profile";
import { useGsapPage } from "@/hooks/useGsapAnimations";

const TECH = [
  "Next.js",
  "TanStack Start",
  "React",
  "Vue",
  "Supabase",
  "PHP",
  "MySQL",
  "Node.js",
  "TypeScript",
  "Tailwind",
];

export const Route = createFileRoute("/sobre-mi")({
  head: () =>
    seo({
      title: "Sobre Luis Carranza | Desarrollador Full Stack",
      description:
        "Conoce a Luis Armando Carranza Cortez, desarrollador full stack y CEO de Novatec especializado en sistemas web, apps y experiencias digitales.",
      path: "/sobre-mi",
    }),
  component: SobreMi,
});

type Perfil = { nombre: string; bio: string; avatar_url: string | null };

function SobreMi() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState<Perfil | null>(null);
  useGsapPage(pageRef);

  useEffect(() => {
    supabase
      .from("perfiles")
      .select("nombre,bio,avatar_url")
      .eq(ADMIN_PROFILE_FILTER.column, ADMIN_PROFILE_FILTER.value)
      .order("actualizado_en", { ascending: false })
      .limit(10)
      .then(({ data }) => setP(pickPublicProfile(data as Perfil[] | null)));
  }, []);

  const img = p?.avatar_url || avatarLuis;

  return (
    <PublicLayout>
      <div ref={pageRef}>
        <section className="mx-auto max-w-5xl px-6 py-16 grid md:grid-cols-[280px_1fr] gap-10 items-start">
          <div data-gsap-hero-visual data-gsap-parallax className="relative mx-auto md:mx-0">
            <div
              data-gsap-drift
              className="absolute -inset-4 bg-gradient-to-tr from-neon/30 to-violet/30 blur-2xl rounded-full"
            />
            <img
              src={img}
              alt={p?.nombre ?? "Luis Carranza, desarrollador full stack"}
              className="relative h-64 w-64 object-cover rounded-3xl glass p-1.5"
              loading="lazy"
              width={768}
              height={768}
            />
          </div>
          <div data-gsap-hero>
            <p className="text-sm uppercase tracking-widest text-neon">Sobre mi</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              {(p?.nombre ?? "Luis Armando Carranza Cortez").split(" ").map((word, index) => (
                <span key={`${word}-${index}`} data-gsap-word className="mr-2 inline-block">
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-muted-foreground mt-2">{SITE.rol}</p>
            <p data-gsap-reveal className="mt-6 text-foreground/90 leading-relaxed">
              {p?.bio}
            </p>

            <h2 data-gsap-reveal className="mt-10 font-display font-semibold text-lg">
              Tecnologias
            </h2>
            <div data-gsap-stagger className="flex flex-wrap gap-2 mt-3">
              {TECH.map((t) => (
                <span
                  key={t}
                  data-gsap-card
                  data-gsap-hover
                  className="px-3 py-1.5 rounded-full glass text-xs hover:text-neon hover:border-neon transition-colors"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
