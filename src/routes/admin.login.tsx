import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/useAuth";
import novatecLogo from "@/assets/novatec-logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Acceso admin - Novatec" }, { name: "robots", content: "noindex" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      checkIsAdmin(session.user.id).then((admin) => {
        if (admin) navigate({ to: "/admin" });
      });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      toast.error("Ingresa tu correo y contrasena");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "No se pudo iniciar sesion");
      return;
    }

    const admin = await checkIsAdmin(data.user.id);
    setLoading(false);

    if (!admin) {
      await supabase.auth.signOut();
      toast.error("Tu usuario no tiene permisos de administrador");
      return;
    }

    toast.success("Bienvenido al panel admin");
    navigate({ to: "/admin" });
  }

  return (
    <div className="admin-shell-bg grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </a>

        <div className="grid overflow-hidden rounded-3xl surface-panel premium-border lg:grid-cols-[1fr_440px]">
          <section className="hidden min-h-[560px] flex-col justify-between border-r border-glass-border p-10 lg:flex">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={novatecLogo}
                  alt="Logo Novatec"
                  className="h-12 w-12 rounded-2xl bg-white object-cover ring-1 ring-glass-border"
                />
                <div>
                  <p className="font-display text-lg font-semibold">Novatec Admin</p>
                  <p className="text-xs text-muted-foreground">Control operativo del portafolio</p>
                </div>
              </div>

              <div className="mt-20 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" />
                  Acceso seguro
                </span>
                <h1 className="mt-5 text-5xl font-bold leading-tight">
                  Gestiona tu web con una experiencia mas limpia.
                </h1>
                <p className="mt-4 text-muted-foreground">
                  Edita proyectos, servicios, mensajes y perfil desde un panel optimizado para
                  escritorio y movil.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Proyectos", "Servicios", "Perfil"].map((item) => (
                <div key={item} className="rounded-2xl glass p-3">
                  <Sparkles className="mb-2 h-4 w-4 text-neon" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-7 text-center lg:text-left">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-glass-border lg:hidden">
                <img src={novatecLogo} alt="Logo Novatec" className="h-full w-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold">
                <span className="text-gradient">Panel</span> Admin
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Accede para gestionar el portafolio
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="admin-email">
                  Correo
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="mt-1 w-full rounded-xl border border-glass-border bg-input px-4 py-3 outline-none transition-colors focus:border-neon"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground" htmlFor="admin-password">
                  Contrasena
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-xl border border-glass-border bg-input px-4 py-3 outline-none transition-colors focus:border-neon"
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-3 font-medium text-background shadow-neon transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Iniciar sesion
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
