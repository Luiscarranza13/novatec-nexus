import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import avatarLuis from "@/assets/avatar-luis.jpg";
import { SITE } from "@/lib/site";
import { seo } from "@/lib/seo";
import { ADMIN_PROFILE_FILTER, pickPublicProfile } from "@/lib/profile";
import { useGsapPage } from "@/hooks/useGsapAnimations";
import { TECH_STACK } from "@/lib/tech-icons";

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
            <p className="text-sm uppercase tracking-widest text-neon">Sobre mí</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              {(p?.nombre ?? "Luis Armando Carranza Cortez").split(" ").map((word, index) => (
                <span key={`${word}-${index}`} data-gsap-word className="mr-2 inline-block">
                  {word}
                </span>
              ))}
            </h1>
            <p className="text-muted-foreground mt-2">{SITE.rol}</p>
            <p data-gsap-reveal className="mt-6 text-foreground/90 leading-relaxed">
              {p?.bio ||
                "Desarrollo productos web modernos, rápidos y administrables para negocios que necesitan una presencia digital sólida y sistemas que puedan crecer."}
            </p>

            <h2 data-gsap-reveal className="mt-10 font-display font-semibold text-lg">
              Tecnologías
            </h2>
            <div data-gsap-stagger className="flex flex-wrap gap-2 mt-3">
              {TECH_STACK.map((tech) => (
                <span
                  key={tech.name}
                  data-gsap-card
                  data-gsap-hover
                  className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs transition-all hover:-translate-y-0.5 hover:border-neon hover:text-neon"
                >
                  <tech.icon className="h-3.5 w-3.5" />
                  {tech.name}
                </span>
              ))}
            </div>
            <Link
              to="/contacto"
              data-gsap-button
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-3 font-medium text-background shadow-neon"
            >
              Trabajemos juntos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
