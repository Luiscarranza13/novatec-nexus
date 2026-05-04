import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Gauge,
  Layers3,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { seo } from "@/lib/seo";
import { getServiceIcon } from "@/lib/service-icons";
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
  "SEO técnico",
  "Integración con Supabase",
];

const PROCESS = [
  {
    title: "Diagnóstico",
    description: "Aterrizo objetivos, alcance, prioridades y el flujo que necesita tu negocio.",
    icon: ClipboardCheck,
  },
  {
    title: "Construcción",
    description: "Diseño e implemento una base rápida, administrable y lista para crecer.",
    icon: Code2,
  },
  {
    title: "Lanzamiento",
    description: "Publico, reviso rendimiento y dejo el sistema preparado para operar.",
    icon: Rocket,
  },
] as const;

const CAPABILITIES = [
  {
    title: "Interfaces adaptables",
    description: "Diseños que se sienten naturales en móvil, tablet y escritorio.",
    icon: Layers3,
  },
  {
    title: "Rendimiento cuidado",
    description: "Estructuras ligeras, carga progresiva y contenido fácil de escanear.",
    icon: Gauge,
  },
  {
    title: "Administración segura",
    description: "Panel privado para actualizar proyectos, servicios, mensajes y perfil.",
    icon: ShieldCheck,
  },
] as const;

const OUTCOMES = [
  "Sitio público listo para presentar tu marca",
  "Panel admin para gestionar contenido sin tocar código",
  "Formulario de contacto conectado a Supabase",
  "Base preparada para crecer con nuevas secciones",
] as const;

function Index() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profile, setProfile] = useState<HomeProfile | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  useGsapPage(pageRef);

  useEffect(() => {
    let active = true;

    supabase
      .from("servicios")
      .select("*")
      .order("orden")
      .then(({ data, error }) => {
        if (!active) return;
        setLoadingServices(false);
        if (error) {
          toast.error("No se pudieron cargar los servicios");
          return;
        }
        setServicios((data as Servicio[]) ?? []);
      });

    supabase
      .from("perfiles")
      .select("whatsapp,avatar_url,nombre")
      .eq(ADMIN_PROFILE_FILTER.column, ADMIN_PROFILE_FILTER.value)
      .order("actualizado_en", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!active) return;
        setProfile(pickPublicProfile(data as HomeProfile[] | null));
      });

    return () => {
      active = false;
    };
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
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-18 md:grid-cols-2 md:py-24 lg:py-28">
            <div data-gsap-hero className="space-y-6 text-center md:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-neon" />
                Disponible para nuevos proyectos
              </span>
              <h1 className="text-4xl font-bold leading-tight overflow-hidden text-balance sm:text-5xl md:text-6xl">
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
              <p className="mx-auto max-w-lg text-base text-muted-foreground sm:text-lg md:mx-0">
                {SITE.rol}. Construyo sistemas web inteligentes, modernos y escalables.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row md:justify-start">
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
              <div className="grid grid-cols-3 gap-2 pt-4 text-left">
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
              <div className="relative aspect-square max-w-[18rem] mx-auto overflow-hidden rounded-3xl glass p-2 sm:max-w-sm lg:max-w-md">
                <img
                  src={heroImage}
                  alt={`${heroName}, desarrollador full stack`}
                  className="w-full h-full object-cover rounded-2xl"
                  width={768}
                  height={768}
                />
              </div>
              <div className="absolute -bottom-4 left-1/2 w-[min(92%,22rem)] -translate-x-1/2 rounded-2xl surface-panel p-3 shadow-elevated sm:-bottom-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Estado
                    </p>
                    <p className="text-sm font-medium">Sistema administrable</p>
                  </div>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
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

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div data-gsap-reveal className="surface-panel rounded-3xl p-5 sm:p-7">
              <p className="text-sm uppercase tracking-widest text-neon">Solución completa</p>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold text-balance sm:text-4xl">
                Una web pública y un panel privado trabajando juntos.
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                El proyecto está pensado para que puedas mostrar tu trabajo, recibir oportunidades y
                actualizar contenido sin fricción.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {OUTCOMES.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl glass p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div data-gsap-stagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {CAPABILITIES.map((capability) => (
                <article
                  key={capability.title}
                  data-gsap-card
                  data-gsap-hover
                  className="surface-panel rounded-3xl p-5 transition-all hover:border-neon/60"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-neon/20 to-violet/20">
                    <capability.icon className="h-5 w-5 text-neon" />
                  </div>
                  <h3 className="mt-4 font-display font-semibold">{capability.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{capability.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div data-gsap-reveal>
              <p className="text-sm uppercase tracking-widest text-neon">Proceso</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                De idea a sistema listo para usar.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Trabajo con entregables claros, decisiones prácticas y una interfaz que se puede
                administrar sin depender de cambios manuales en el código.
              </p>
              <Link
                to="/contacto"
                data-gsap-button
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl glass px-5 py-3 hover:border-neon"
              >
                Empezar ahora <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div data-gsap-stagger className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {PROCESS.map((step, index) => (
                <article
                  key={step.title}
                  data-gsap-card
                  data-gsap-hover
                  className="surface-panel rounded-2xl p-4 transition-all hover:border-neon/60 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon/20 to-violet/20">
                      <step.icon className="h-5 w-5 text-neon" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paso {index + 1}</p>
                      <h3 className="font-display font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div data-gsap-reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Servicios <span className="text-gradient">destacados</span>
            </h2>
            <p className="text-muted-foreground mt-3">
              Soluciones digitales completas pensadas para escalar tu idea o negocio.
            </p>
          </div>
          <div data-gsap-stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingServices
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="glass rounded-2xl p-6">
                    <div className="mb-4 h-11 w-11 rounded-xl bg-muted shimmer" />
                    <div className="h-4 w-2/3 rounded bg-muted shimmer" />
                    <div className="mt-3 h-3 w-full rounded bg-muted shimmer" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-muted shimmer" />
                  </div>
                ))
              : servicios.slice(0, 4).map((s) => {
                  const Icon = getServiceIcon(s.icono);
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
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {s.descripcion}
                      </p>
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

        <section className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28">
          <div
            data-gsap-reveal
            className="surface-panel premium-border rounded-3xl p-6 text-center sm:p-8"
          >
            <p className="text-sm uppercase tracking-widest text-neon">Próximo paso</p>
            <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-bold text-balance sm:text-4xl">
              Convierte tu portafolio en una herramienta comercial.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Si necesitas una web rápida, administrable y lista para crecer, podemos definir el
              alcance y empezar por la versión esencial.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/contacto"
                data-gsap-button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-3 font-medium text-background shadow-neon"
              >
                Solicitar propuesta <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/proyectos"
                data-gsap-button
                className="inline-flex items-center justify-center gap-2 rounded-xl glass px-5 py-3 hover:border-neon"
              >
                Ver portafolio
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
