import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Cambiar a modo ${nextTheme === "dark" ? "oscuro" : "claro"}`}
      title={`Modo ${nextTheme === "dark" ? "oscuro" : "claro"}`}
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-glass-border bg-background/70 text-foreground transition-all hover:scale-105 hover:border-foreground/30 hover:shadow-elevated"
    >
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
