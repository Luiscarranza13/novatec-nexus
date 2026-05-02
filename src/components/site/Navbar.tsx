import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/sobre-mi", label: "Sobre mí" },
  { to: "/servicios", label: "Servicios" },
  { to: "/proyectos", label: "Proyectos" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <nav className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon to-violet shadow-neon">
              <Sparkles className="h-5 w-5 text-background" />
            </span>
            <span className="font-display font-semibold tracking-tight">
              <span className="text-gradient">Novatec</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors",
                      active
                        ? "text-foreground bg-white/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
            <Link
              to="/admin"
              className="text-xs text-muted-foreground hover:text-neon transition-colors"
            >
              Admin
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl p-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
