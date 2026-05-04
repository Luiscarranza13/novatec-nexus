import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, ArrowRight, FolderKanban, Loader2, Mail, Star, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Resumen · Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

type RecentProject = {
  id: string;
  nombre: string;
  categoria: string;
  destacado: boolean;
};

type RecentMessage = {
  id: string;
  nombre: string;
  correo: string;
  leido: boolean;
};

function AdminHome() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState({ proyectos: 0, servicios: 0, mensajes: 0, sinLeer: 0 });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      const [p, s, m, sl, rp, rm] = await Promise.all([
        supabase.from("proyectos").select("id", { count: "exact", head: true }),
        supabase.from("servicios").select("id", { count: "exact", head: true }),
        supabase.from("mensajes").select("id", { count: "exact", head: true }),
        supabase.from("mensajes").select("id", { count: "exact", head: true }).eq("leido", false),
        supabase.from("proyectos").select("id,nombre,categoria,destacado").order("orden").limit(5),
        supabase
          .from("mensajes")
          .select("id,nombre,correo,leido")
          .order("creado_en", { ascending: false })
          .limit(5),
      ]);

      if (!active) return;
      setLoading(false);

      const firstError = p.error ?? s.error ?? m.error ?? sl.error ?? rp.error ?? rm.error;
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
      setRecentProjects((rp.data as RecentProject[]) ?? []);
      setRecentMessages((rm.data as RecentMessage[]) ?? []);
    }

    void loadDashboard();
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Portafolio</p>
              <h2 className="font-display text-lg font-semibold">Proyectos visibles</h2>
            </div>
            <Link to="/admin/proyectos" className="text-xs text-neon hover:underline">
              Gestionar
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-muted shimmer" />
              ))
            ) : recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/admin/proyectos"
                  className="flex items-center justify-between gap-3 rounded-xl glass px-3 py-2.5 text-sm hover:border-neon"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{project.nombre}</span>
                    <span className="text-xs text-muted-foreground">{project.categoria}</span>
                  </span>
                  {project.destacado && <Star className="h-4 w-4 shrink-0 fill-neon text-neon" />}
                </Link>
              ))
            ) : (
              <p className="rounded-xl glass p-4 text-sm text-muted-foreground">
                Todavía no hay proyectos publicados.
              </p>
            )}
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Bandeja</p>
              <h2 className="font-display text-lg font-semibold">Mensajes recientes</h2>
            </div>
            <Link to="/admin/mensajes" className="text-xs text-neon hover:underline">
              Revisar
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-muted shimmer" />
              ))
            ) : recentMessages.length > 0 ? (
              recentMessages.map((message) => (
                <Link
                  key={message.id}
                  to="/admin/mensajes"
                  className="flex items-center justify-between gap-3 rounded-xl glass px-3 py-2.5 text-sm hover:border-neon"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{message.nombre}</span>
                    <span className="text-xs text-muted-foreground">{message.correo}</span>
                  </span>
                  {!message.leido && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-neon shadow-neon" />
                  )}
                </Link>
              ))
            ) : (
              <p className="rounded-xl glass p-4 text-sm text-muted-foreground">
                Todavía no hay mensajes recibidos.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
