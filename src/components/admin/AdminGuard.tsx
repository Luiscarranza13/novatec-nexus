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
  ScanFace,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { swal } from "@/lib/swal";
import novatecLogo from "@/assets/novatec-logo.png";
import { AdminLoader } from "./AdminLoader";

const items = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/admin/proyectos", label: "Proyectos", icon: FolderKanban },
  { to: "/admin/servicios", label: "Servicios", icon: Wrench },
  { to: "/admin/mensajes", label: "Mensajes", icon: Mail },
  { to: "/admin/perfil", label: "Perfil", icon: UserCircle },
  { to: "/admin/biometric", label: "Biométrica", icon: ScanFace },
] as const;

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/admin/login" }); return; }
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
    const result = await swal.confirm({
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión administrativa.",
      confirmText: "Cerrar sesión",
    });
    if (!result.isConfirmed) return;
    await supabase.auth.signOut();
    await swal.success("Sesión cerrada");
    navigate({ to: "/admin/login" });
  }

  return (
    <div className="admin-shell-bg min-h-screen">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-glass-border glass lg:flex xl:w-64">
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-glass-border">
          <span className="h-8 w-8 shrink-0 rounded-xl overflow-hidden bg-white ring-1 ring-glass-border">
            <img src={novatecLogo} alt="Logo Novatec" className="h-full w-full object-cover" />
          </span>
          <span className="font-display text-sm font-semibold">
            <span className="text-gradient">Novatec</span> Admin
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((it) => {
            const active = it.exact
              ? location.pathname === it.to || location.pathname === "/admin/"
              : location.pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-neon/10 text-neon border border-neon/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-glass-border p-3">
          <Link to="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Ir al sitio
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-white/5"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-glass-border glass px-4 py-2.5 lg:hidden">
        <Link to="/admin" className="flex min-w-0 flex-1 items-center gap-2">
          <span className="h-7 w-7 shrink-0 rounded-lg overflow-hidden bg-white ring-1 ring-glass-border">
            <img src={novatecLogo} alt="Logo Novatec" className="h-full w-full object-cover" />
          </span>
          <span className="truncate font-display text-sm font-semibold">
            <span className="text-gradient">Novatec</span> Admin
          </span>
        </Link>
        <button onClick={logout} className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-destructive" aria-label="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Nav mobile */}
      <nav className="sticky top-[45px] z-30 flex gap-1 overflow-x-auto border-b border-glass-border glass px-3 py-2 lg:hidden">
        {items.map((it) => {
          const active = it.exact
            ? location.pathname === it.to || location.pathname === "/admin/"
            : location.pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-neon/10 text-neon" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:ml-56 lg:px-8 lg:py-8 xl:ml-64">
        <div className="mx-auto w-full max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  );
}
