import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acceso admin · Novatec" }, { name: "robots", content: "noindex" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, redirige
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bienvenido");
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-violet glow-neon mb-3">
            <Sparkles className="h-6 w-6 text-background" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient">Panel</span> Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Accede para gestionar el portafolio</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-glass-border focus:border-neon focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-glass-border focus:border-neon focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium hover:opacity-90 disabled:opacity-60 glow-neon"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
