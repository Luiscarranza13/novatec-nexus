import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import avatarLuis from "@/assets/avatar-luis.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luis Carranza · Full Stack & CEO de Novatec" },
      { name: "description", content: SITE.descripcion },
    ],
  }),
  component: Index,
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string };

function Index() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [whatsapp, setWhatsapp] = useState<string>("");

  useEffect(() => {
    supabase.from("servicios").select("*").order("orden").then(({ data }) => {
      setServicios((data as Servicio[]) ?? []);
    });
    supabase.from("perfiles").select("whatsapp").limit(1).maybeSingle().then(({ data }) => {
      setWhatsapp((data as { whatsapp: string } | null)?.whatsapp ?? "");
    });
  }, []);

  const waUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hola Luis, me interesa hablar contigo")}`
    : "/contacto";

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-neon" />
              Disponible para nuevos proyectos
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Hola, soy <br />
              <span className="text-gradient">Luis Armando</span>
              <br />
              <span className="text-foreground">Carranza Cortez</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              {SITE.rol}. Construyo sistemas web inteligentes, modernos y escalables.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/proyectos"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium hover:opacity-90 transition-all glow-neon"
              >
                Ver proyectos <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass hover:border-neon transition-all"
              >
                <MessageCircle className="h-4 w-4 text-neon" />
                Contacto WhatsApp
              </a>
            </div>
          </div>

          <div className="relative animate-float">
            <div className="absolute -inset-8 bg-gradient-to-tr from-neon/30 via-violet/30 to-transparent blur-3xl rounded-full" />
            <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden glass p-2">
              <img
                src={avatarLuis}
                alt="Luis Armando Carranza Cortez"
                className="w-full h-full object-cover rounded-2xl"
                width={768}
                height={768}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Servicios <span className="text-gradient">destacados</span>
          </h2>
          <p className="text-muted-foreground mt-3">
            Soluciones digitales completas pensadas para escalar tu idea o negocio.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {servicios.map((s) => {
            const Icon = ((Icons as unknown as Record<string, LucideIcon>)[s.icono] ?? Sparkles) as LucideIcon;
            return (
              <div
                key={s.id}
                className="group glass rounded-2xl p-6 hover:border-neon/60 transition-all hover:-translate-y-1"
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
          <Link to="/servicios" className="inline-flex items-center gap-2 text-neon hover:underline">
            Ver todos los servicios <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
