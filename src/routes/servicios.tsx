import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Sparkles, type LucideIcon } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/servicios")({
  head: () => ({
    meta: [
      { title: "Servicios · Novatec" },
      { name: "description", content: "Desarrollo web, sistemas inteligentes, apps móviles y diseño UI/UX." },
    ],
  }),
  component: Servicios,
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string };

function Servicios() {
  const [items, setItems] = useState<Servicio[]>([]);
  useEffect(() => {
    supabase.from("servicios").select("*").order("orden").then(({ data }) => setItems((data as Servicio[]) ?? []));
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-widest text-neon">Lo que hacemos</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            <span className="text-gradient">Servicios</span> profesionales
          </h1>
          <p className="text-muted-foreground mt-3">
            Cada servicio está diseñado para entregar resultados reales: rápidos, escalables y con un diseño impecable.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((s) => {
            const Icon = ((Icons as unknown as Record<string, LucideIcon>)[s.icono] ?? Sparkles) as LucideIcon;
            return (
              <div key={s.id} className="glass rounded-3xl p-7 hover:border-violet/60 transition-all">
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
      </section>
    </PublicLayout>
  );
}
