import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, FolderKanban, Loader2, Mail, Wrench } from "lucide-react";
import { toast } from "sonner";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCounts() {
      setLoading(true);
      const [p, s, m, sl] = await Promise.all([
        supabase.from("proyectos").select("id", { count: "exact", head: true }),
        supabase.from("servicios").select("id", { count: "exact", head: true }),
        supabase.from("mensajes").select("id", { count: "exact", head: true }),
        supabase.from("mensajes").select("id", { count: "exact", head: true }).eq("leido", false),
      ]);

      if (!active) return;
      setLoading(false);

      const firstError = p.error ?? s.error ?? m.error ?? sl.error;
      if (firstError) {
        toast.error(firstError.message);
        return;
      }

      setCounts({
        proyectos: p.count ?? 0,
        servicios: s.count ?? 0,
        mensajes: m.count ?? 0,
        sinLeer: sl.count ?? 0,
      });
    }

    void loadCounts();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Proyectos", value: counts.proyectos, icon: FolderKanban, to: "/admin/proyectos" },
    { label: "Servicios", value: counts.servicios, icon: Wrench, to: "/admin/servicios" },
    {
      label: "Mensajes",
      value: counts.mensajes,
      icon: Mail,
      to: "/admin/mensajes",
      badge: counts.sinLeer,
    },
  ] as const;

  return (
    <div>
      <div className="rounded-3xl surface-panel premium-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-neon" />
              Panel operativo
            </span>
            <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
              Hola, <span className="text-gradient">Admin</span>
            </h1>
            <p className="mt-1 text-muted-foreground">Resumen de tu portafolio Novatec.</p>
          </div>
          <div className="rounded-2xl glass px-4 py-3 text-sm text-muted-foreground">
            {loading ? "Sincronizando..." : `${counts.sinLeer} mensajes pendientes`}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="surface-panel group rounded-2xl p-4 transition-all hover:border-neon/60 sm:p-5"
          >
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
              <span className="text-3xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : c.value}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-neon group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
