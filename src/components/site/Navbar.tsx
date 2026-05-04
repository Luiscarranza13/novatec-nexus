import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import novatecLogo from "@/assets/novatec-logo.png";
import { useGsapNavbar } from "@/hooks/useGsapAnimations";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/sobre-mi", label: "Sobre mi" },
  { to: "/servicios", label: "Servicios" },
  { to: "/proyectos", label: "Proyectos" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { location } = useRouterState();
  useGsapNavbar(headerRef);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header ref={headerRef} className="fixed top-0 inset-x-0 z-50 will-change-transform">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <nav className="glass premium-border flex items-center justify-between rounded-2xl px-4 py-3">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
            <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-neon ring-1 ring-glass-border">
              <img
                src={novatecLogo}
                alt="Logo Novatec"
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
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
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/admin"
              data-gsap-button
              className="rounded-full border border-glass-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Admin
            </Link>
          </div>

          <div className="md:hidden ml-auto mr-2">
            <ThemeToggle />
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl p-2 shadow-elevated">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-3 py-3 text-sm rounded-xl transition-colors",
                  location.pathname === l.to
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl border border-glass-border px-3 py-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
