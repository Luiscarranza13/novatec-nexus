import { Link } from "@tanstack/react-router";
import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function SiteEnhancements() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0);
      setShowTop(scrollTop > 420);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed left-0 right-0 top-0 z-[80] h-0.5 bg-transparent">
        <div
          className="h-full bg-foreground transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <Link
          to="/contacto"
          aria-label="Ir a contacto"
          className="pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background shadow-elevated transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-5 w-5" />
        </Link>
        {showTop && (
          <button
            type="button"
            aria-label="Volver arriba"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl glass shadow-elevated transition-transform hover:-translate-y-0.5"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </>,
    document.body,
  );
}
