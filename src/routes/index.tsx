import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { seo } from "@/lib/seo";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import avatarLuis from "@/assets/avatar-luis.jpg";
import { ADMIN_PROFILE_FILTER, pickPublicProfile } from "@/lib/profile";
import { useGsapPage } from "@/hooks/useGsapAnimations";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Luis Carranza | Desarrollo web y sistemas inteligentes",
      description: SITE.descripcion,
    }),
  component: Index,
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string };
type HomeProfile = { whatsapp: string | null; avatar_url: string | null; nombre: string | null };

const STATS = [
  { value: "24/7", label: "Presencia digital" },
  { value: "+10", label: "Soluciones escalables" },
  { value: "100%", label: "Enfoque a resultados" },
] as const;

const TRUST_POINTS = [
  "Diseño responsive",
  "Panel administrable",
  "SEO tecnico",
  "Integracion con Supabase",
];

function Index() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profile, setProfile] = useState<HomeProfile | null>(null);
  useGsapPage(pageRef);

  useEffect(() => {
    supabase
      .from("servicios")
      .select("*")
      .order("orden")
      .then(({ data }) => {
        setServicios((data as Servicio[]) ?? []);
      });
    supabase
      .from("perfiles")
      .select("whatsapp,avatar_url,nombre")
      .eq(ADMIN_PROFILE_FILTER.column, ADMIN_PROFILE_FILTER.value)
      .order("actualizado_en", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setProfile(pickPublicProfile(data as HomeProfile[] | null));
      });
  }, []);

  const whatsapp = profile?.whatsapp ?? "";
  const heroImage = profile?.avatar_url || avatarLuis;
  const heroName = profile?.nombre || "Luis Armando Carranza Cortez";
  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Luis, me interesa hablar contigo")}`
    : "/contacto";

  return (
    <PublicLayout>
      <div ref={pageRef}>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
            <div data-gsap-hero className="space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-neon" />
                Disponible para nuevos proyectos
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight overflow-hidden">
                <span data-gsap-word className="inline-block">
                  Hola,
                </span>{" "}
                <span data-gsap-word className="inline-block">
                  soy
                </span>{" "}
                <br />
                <span data-gsap-word className="inline-block text-gradient">
                  Luis
                </span>{" "}
                <span data-gsap-word className="inline-block text-gradient">
                  Armando
                </span>
                <br />
                <span data-gsap-word className="inline-block text-foreground">
                  Carranza
                </span>{" "}
                <span data-gsap-word className="inline-block text-foreground">
                  Cortez
                </span>
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                {SITE.rol}. Construyo sistemas web inteligentes, modernos y escalables.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  to="/proyectos"
                  data-gsap-button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-3 font-medium text-background shadow-neon transition-all hover:opacity-90"
                >
                  Ver proyectos <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  data-gsap-button
                  className="inline-flex items-center justify-center gap-2 rounded-xl glass px-5 py-3 transition-all hover:border-neon"
                >
                  <MessageCircle className="h-4 w-4 text-neon" />
                  Contacto WhatsApp
                </a>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4">
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-2xl surface-panel p-3">
                    <p className="font-display text-lg font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div data-gsap-hero-visual data-gsap-parallax className="relative">
              <div
                data-gsap-drift
                className="absolute -inset-8 bg-gradient-to-tr from-neon/20 via-violet/20 to-transparent blur-3xl rounded-full"
              />
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden glass p-2">
                <img
                  src={heroImage}
                  alt={`${heroName}, desarrollador full stack`}
                  className="w-full h-full object-cover rounded-2xl"
                  width={768}
                  height={768}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div
            data-gsap-reveal
            className="grid gap-3 rounded-3xl surface-panel p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-neon" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div data-gsap-reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Servicios <span className="text-gradient">destacados</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              Soluciones digitales completas pensadas para escalar tu idea o negocio.
            </p>
          </div>
          <div data-gsap-stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {servicios.map((s) => {
              const Icon = ((Icons as unknown as Record<string, LucideIcon>)[s.icono] ??
                Sparkles) as LucideIcon;
              return (
                <div
                  key={s.id}
                  data-gsap-card
                  data-gsap-hover
                  className="group glass rounded-2xl p-6 hover:border-neon/60 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-neon/20 to-violet/20 flex items-center justify-center mb-4 group-hover:glow-neon transition-all">
                    <Icon className="h-5 w-5 text-neon" />
                  </div>
                  <h3 className="font-display font-semibold">{s.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.descripcion}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/servicios"
              data-gsap-button
              className="inline-flex items-center gap-2 text-neon hover:underline"
            >
              Ver todos los servicios <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
