import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { seo } from "@/lib/seo";
import { useGsapPage } from "@/hooks/useGsapAnimations";
import { getServiceIcon } from "@/lib/service-icons";

export const Route = createFileRoute("/servicios")({
  head: () =>
    seo({
      title: "Servicios de desarrollo web, apps y UI/UX | Novatec",
      description:
        "Servicios profesionales de desarrollo web, sistemas inteligentes, apps móviles y diseño UI/UX para empresas y emprendedores.",
      path: "/servicios",
    }),
  component: Servicios,
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string };

function Servicios() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  useGsapPage(pageRef);

  useEffect(() => {
    let active = true;
    supabase
      .from("servicios")
      .select("*")
      .order("orden")
      .then(({ data, error }) => {
        if (!active) return;
        setLoading(false);
        if (error) {
          toast.error("No se pudieron cargar los servicios");
          return;
        }
        setItems((data as Servicio[]) ?? []);
      });

    return () => {
      active = false;
    };
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
              Cada servicio está diseñado para entregar resultados reales: rápidos, escalables y con
              un diseño impecable.
            </p>
          </div>

          <div data-gsap-stagger className="grid gap-4 md:grid-cols-2 lg:gap-5">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="surface-panel rounded-3xl p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted shimmer" />
                      <div className="w-full">
                        <div className="h-5 w-1/2 rounded bg-muted shimmer" />
                        <div className="mt-4 h-3 w-full rounded bg-muted shimmer" />
                        <div className="mt-2 h-3 w-5/6 rounded bg-muted shimmer" />
                      </div>
                    </div>
                  </div>
                ))
              : items.map((s) => {
                  const Icon = getServiceIcon(s.icono);
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
                          <p className="text-muted-foreground mt-2 leading-relaxed">
                            {s.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
          <div
            data-gsap-reveal
            className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl surface-panel p-5 text-center sm:flex-row sm:p-6 sm:text-left"
          >
            <p className="text-sm text-muted-foreground">
              Convierte una idea, proceso o negocio en una experiencia digital lista para crecer.
            </p>
            <Link
              to="/contacto"
              data-gsap-button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-2.5 font-medium text-background shadow-neon"
            >
              Cotizar proyecto <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
