import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Search, Star } from "lucide-react";
import { toast } from "sonner";
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
        "Portafolio de proyectos destacados de Luis Carranza y Novatec en desarrollo web, software, automatización y experiencias digitales.",
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
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  useGsapPage(pageRef);

  useEffect(() => {
    let active = true;
    supabase
      .from("proyectos")
      .select("*")
      .order("orden")
      .then(({ data, error }) => {
        if (!active) return;
        setLoading(false);
        if (error) {
          toast.error("No se pudieron cargar los proyectos");
          return;
        }
        setItems((data as Proyecto[]) ?? []);
      });

    return () => {
      active = false;
    };
  }, []);

  const categorias = useMemo(
    () => ["Todos", ...Array.from(new Set(items.map((p) => p.categoria)))],
    [items],
  );

  const visible = useMemo(() => {
    const byCategory = filtro === "Todos" ? items : items.filter((p) => p.categoria === filtro);
    const term = query.trim().toLowerCase();
    if (!term) return byCategory;
    return byCategory.filter((p) =>
      [p.nombre, p.descripcion, p.categoria].join(" ").toLowerCase().includes(term),
    );
  }, [filtro, items, query]);

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
            <p className="mt-3 text-muted-foreground">
              Explora proyectos por categoría, tecnología o necesidad de negocio.
            </p>
          </div>

          <label
            data-gsap-reveal
            className="glass mx-auto mb-5 flex max-w-xl items-center gap-2 rounded-2xl px-4 py-3"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Buscar proyectos"
            />
          </label>

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

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="surface-panel overflow-hidden rounded-2xl">
                  <div className="aspect-[16/10] bg-muted shimmer" />
                  <div className="p-5">
                    <div className="h-3 w-20 rounded bg-muted shimmer" />
                    <div className="mt-3 h-5 w-2/3 rounded bg-muted shimmer" />
                    <div className="mt-3 h-3 w-full rounded bg-muted shimmer" />
                    <div className="mt-2 h-3 w-4/5 rounded bg-muted shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              No hay proyectos para esta búsqueda.
            </p>
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
