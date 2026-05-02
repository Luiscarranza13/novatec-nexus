import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, FolderKanban, Wrench, Mail, UserCircle, LogOut, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const items: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
  { to: "/admin/servicios", label: "Servicios", icon: Wrench },
  { to: "/admin/mensajes", label: "Mensajes", icon: Mail },
  { to: "/admin/perfil", label: "Perfil", icon: UserCircle },
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/admin/login" });
    else if (!isAdmin) {
      toast.error("No tienes permisos de administrador");
      supabase.auth.signOut();
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="h-10 w-10 rounded-full border-2 border-neon border-t-transparent animate-spin" />
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-glass-border glass md:min-h-screen p-4 flex flex-col">
        <Link to="/admin" className="flex items-center gap-2 mb-8 px-2">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon to-violet grid place-items-center">
            <Sparkles className="h-5 w-5 text-background" />
          </span>
          <span className="font-display font-semibold">
            <span className="text-gradient">Novatec</span> Admin
          </span>
        </Link>

        <nav className="space-y-1 flex-1">
          {items.map((it) => {
            const active = it.exact ? location.pathname === it.to : location.pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                  active
                    ? "bg-gradient-to-r from-neon/15 to-violet/15 text-foreground border border-neon/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 pt-4 border-t border-glass-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al sitio
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
