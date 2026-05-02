import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";
import { useGsapPage } from "@/hooks/useGsapAnimations";

export const Route = createFileRoute("/proyectos")({
  head: () =>
    seo({
      title: "Proyectos de desarrollo web y software | Luis Carranza",
      description:
        "Portafolio de proyectos destacados de Luis Carranza y Novatec en desarrollo web, software, automatizacion y experiencias digitales.",
      path: "/proyectos",
    }),
  component: Proyectos,
});

type Proyecto = {
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  link: string | null;
  categoria: string;
  destacado: boolean;
};

function Proyectos() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Proyecto[]>([]);
  const [filtro, setFiltro] = useState<string>("Todos");
  useGsapPage(pageRef);

  useEffect(() => {
    supabase
      .from("proyectos")
      .select("*")
      .order("orden")
      .then(({ data }) => setItems((data as Proyecto[]) ?? []));
  }, []);

  const categorias = useMemo(
    () => ["Todos", ...Array.from(new Set(items.map((p) => p.categoria)))],
    [items],
  );

  const visible = filtro === "Todos" ? items : items.filter((p) => p.categoria === filtro);

  return (
    <PublicLayout>
      <div ref={pageRef}>
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div data-gsap-hero className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm uppercase tracking-widest text-neon">Portafolio</p>
            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              <span data-gsap-word className="inline-block text-gradient">
                Proyectos
              </span>{" "}
              <span data-gsap-word className="inline-block">
                recientes
              </span>
            </h1>
          </div>

          <div data-gsap-reveal className="mb-8 flex flex-wrap justify-center gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                data-gsap-button
                className={cn(
                  "px-4 py-2 text-sm rounded-full transition-all",
                  filtro === c
                    ? "bg-gradient-to-r from-neon to-violet text-background font-medium glow-neon"
                    : "surface-panel text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No hay proyectos aun.</p>
          ) : (
            <div data-gsap-stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {visible.map((p) => (
                <article
                  key={p.id}
                  data-gsap-card
                  data-gsap-hover
                  className="group surface-panel overflow-hidden rounded-2xl transition-all hover:border-neon/60"
                >
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-violet/30 to-neon/20 overflow-hidden">
                    {p.imagen_url ? (
                      <img
                        src={p.imagen_url}
                        alt={`${p.nombre} - proyecto de ${p.categoria}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center">
                        <span className="text-4xl font-display text-gradient opacity-60">
                          {p.nombre.charAt(0)}
                        </span>
                      </div>
                    )}
                    {p.destacado && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full glass">
                        <Star className="h-3 w-3 text-neon fill-neon" /> Destacado
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-neon uppercase tracking-wider">
                      {p.categoria}
                    </span>
                    <h3 className="font-display text-lg font-semibold mt-1">{p.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {p.descripcion}
                    </p>
                    {p.link && p.link !== "#" && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noreferrer"
                        data-gsap-button
                        className="inline-flex items-center gap-1 text-sm text-neon hover:underline mt-3"
                      >
                        Ver proyecto <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicLayout>
  );
}
