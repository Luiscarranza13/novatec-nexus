import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as Icons from "lucide-react";
import { Sparkles, type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { useGsapPage } from "@/hooks/useGsapAnimations";

export const Route = createFileRoute("/servicios")({
  head: () =>
    seo({
      title: "Servicios de desarrollo web, apps y UI/UX | Novatec",
      description:
        "Servicios profesionales de desarrollo web, sistemas inteligentes, apps moviles y diseno UI/UX para empresas y emprendedores.",
      path: "/servicios",
    }),
  component: Servicios,
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string };

function Servicios() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Servicio[]>([]);
  useGsapPage(pageRef);

  useEffect(() => {
    supabase
      .from("servicios")
      .select("*")
      .order("orden")
      .then(({ data }) => setItems((data as Servicio[]) ?? []));
  }, []);

  return (
    <PublicLayout>
      <div ref={pageRef}>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div data-gsap-hero className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm uppercase tracking-widest text-neon">Lo que hacemos</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              <span data-gsap-word className="inline-block text-gradient">
                Servicios
              </span>{" "}
              <span data-gsap-word className="inline-block">
                profesionales
              </span>
            </h1>
            <p className="text-muted-foreground mt-3">
              Cada servicio esta disenado para entregar resultados reales: rapidos, escalables y con
              un diseno impecable.
            </p>
          </div>

          <div data-gsap-stagger className="grid gap-4 md:grid-cols-2 lg:gap-5">
            {items.map((s) => {
              const Icon = ((Icons as unknown as Record<string, LucideIcon>)[s.icono] ??
                Sparkles) as LucideIcon;
              return (
                <div
                  key={s.id}
                  data-gsap-card
                  data-gsap-hover
                  className="surface-panel rounded-3xl p-6 transition-all hover:border-violet/60 sm:p-7"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-neon/30 to-violet/30 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-neon" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{s.titulo}</h3>
                      <p className="text-muted-foreground mt-2 leading-relaxed">{s.descripcion}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div data-gsap-reveal className="mt-10 rounded-3xl surface-panel p-5 text-center sm:p-6">
            <p className="text-sm text-muted-foreground">
              Cada servicio se puede editar desde el panel admin y aparece automaticamente en la
              web.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
