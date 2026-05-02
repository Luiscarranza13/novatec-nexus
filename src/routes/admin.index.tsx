import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FolderKanban, Wrench, Mail, ArrowRight } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Resumen · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState({ proyectos: 0, servicios: 0, mensajes: 0, sinLeer: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("proyectos").select("id", { count: "exact", head: true }),
      supabase.from("servicios").select("id", { count: "exact", head: true }),
      supabase.from("mensajes").select("id", { count: "exact", head: true }),
      supabase.from("mensajes").select("id", { count: "exact", head: true }).eq("leido", false),
    ]).then(([p, s, m, sl]) => {
      setCounts({
        proyectos: p.count ?? 0, servicios: s.count ?? 0,
        mensajes: m.count ?? 0, sinLeer: sl.count ?? 0,
      });
    });
  }, []);

  const cards = [
    { label: "Proyectos", value: counts.proyectos, icon: FolderKanban, to: "/admin/proyectos" },
    { label: "Servicios", value: counts.servicios, icon: Wrench, to: "/admin/servicios" },
    { label: "Mensajes", value: counts.mensajes, icon: Mail, to: "/admin/mensajes", badge: counts.sinLeer },
  ] as const;

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Hola, <span className="text-gradient">Luis</span> 👋
      </h1>
      <p className="text-muted-foreground mt-1">Resumen de tu portafolio Novatec.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="glass rounded-2xl p-5 hover:border-neon/60 transition-all group">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon/20 to-violet/20 grid place-items-center">
                <c.icon className="h-5 w-5 text-neon" />
              </div>
              {"badge" in c && c.badge ? (
                <span className="text-xs px-2 py-1 rounded-full bg-violet text-violet-foreground">
                  {c.badge} sin leer
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground mt-4">{c.label}</p>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold">{c.value}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-neon group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
