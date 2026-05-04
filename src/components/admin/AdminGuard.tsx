import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Wrench,
  Mail,
  UserCircle,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import novatecLogo from "@/assets/novatec-logo.png";
import { AdminLoader } from "./AdminLoader";

const items: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}[] = [
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
    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    if (!isAdmin) {
      toast.error("No tienes permisos de administrador");
      void supabase.auth.signOut();
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="admin-shell-bg min-h-screen">
        <AdminLoader label="Validando acceso..." />
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    toast.success("Sesion cerrada");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="admin-shell-bg min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-40 border-b border-glass-border glass lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[280px] lg:flex-col lg:border-b-0 lg:border-r lg:p-5">
        <div className="flex items-center gap-3 px-4 py-3 lg:hidden">
          <Link to="/admin" className="flex min-w-0 flex-1 items-center gap-2">
            <span className="h-9 w-9 shrink-0 rounded-xl overflow-hidden bg-white ring-1 ring-glass-border">
              <img src={novatecLogo} alt="Logo Novatec" className="h-full w-full object-cover" />
            </span>
            <span className="truncate font-display font-semibold">
              <span className="text-gradient">Novatec</span> Admin
            </span>
          </Link>
          <button
            onClick={logout}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-destructive lg:hidden"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden lg:block">
          <Link to="/admin" className="mb-8 flex items-center gap-2 px-2">
            <span className="h-9 w-9 rounded-xl overflow-hidden bg-white ring-1 ring-glass-border">
              <img src={novatecLogo} alt="Logo Novatec" className="h-full w-full object-cover" />
            </span>
            <span className="font-display font-semibold">
              <span className="text-gradient">Novatec</span> Admin
            </span>
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {items.map((it) => {
            const active = it.exact
              ? location.pathname === it.to || location.pathname === "/admin/"
              : location.pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors lg:gap-3",
                  active
                    ? "bg-gradient-to-r from-neon/15 to-violet/15 text-foreground border border-neon/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <it.icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden space-y-1 border-t border-glass-border pt-4 lg:block">
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

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:col-start-2 lg:px-8 lg:py-10 xl:px-10">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
