import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/useAuth";
import novatecLogo from "@/assets/novatec-logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Acceso admin - Novatec" }, { name: "robots", content: "noindex" }],
  }),
  component: Login,
});

const accessHighlights = ["Proyectos", "Servicios", "Mensajes", "Perfil"] as const;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error("Ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "No se pudo iniciar sesión");
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
    <div className="admin-shell-bg grid min-h-svh place-items-center px-3 py-4 sm:px-5">
      <div className="w-full max-w-5xl">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </Link>

        <div className="grid overflow-hidden rounded-3xl surface-panel premium-border lg:grid-cols-[0.95fr_0.8fr]">
          <section className="relative hidden min-h-[520px] overflow-hidden border-r border-glass-border p-7 lg:flex lg:flex-col lg:justify-between xl:p-8">
            <div className="absolute inset-0 grid-bg opacity-35" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <img
                  src={novatecLogo}
                  alt="Logo Novatec"
                  className="h-11 w-11 rounded-2xl bg-white object-cover ring-1 ring-glass-border"
                />
                <div>
                  <p className="font-display text-lg font-semibold">Novatec Admin</p>
                  <p className="text-xs text-muted-foreground">Control del portafolio</p>
                </div>
              </div>

              <div className="mt-12 max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-neon" />
                  Acceso protegido
                </span>
                <h1 className="mt-5 text-4xl font-bold leading-tight text-balance xl:text-5xl">
                  Gestiona tu web con claridad y rapidez.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Actualiza contenido, revisa mensajes y mantén tu presencia digital operativa desde
                  un panel ligero y responsive.
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-4 gap-2">
              {accessHighlights.map((item) => (
                <div key={item} className="rounded-2xl glass p-3 text-center">
                  <Sparkles className="mx-auto mb-2 h-4 w-4 text-neon" />
                  <p className="text-xs font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto flex min-h-full w-full max-w-sm flex-col justify-center">
              <div className="mb-5 rounded-3xl glass p-4 lg:hidden">
                <div className="flex items-center gap-3">
                  <img
                    src={novatecLogo}
                    alt="Logo Novatec"
                    className="h-11 w-11 rounded-2xl bg-white object-cover ring-1 ring-glass-border"
                  />
                  <div>
                    <p className="font-display font-semibold">Novatec Admin</p>
                    <p className="text-xs text-muted-foreground">Panel de gestión</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-neon" />
                  Sesión administrativa
                </span>
                <h2 className="mt-4 text-3xl font-bold">
                  Accede al <span className="text-gradient">panel</span>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ingresa tus credenciales para continuar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-sm text-muted-foreground" htmlFor="admin-email">
                    Correo
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-glass-border bg-input px-3 transition-colors focus-within:border-neon">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="min-h-11 w-full bg-transparent py-2.5 text-sm outline-none"
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground" htmlFor="admin-password">
                    Contraseña
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-glass-border bg-input px-3 transition-colors focus-within:border-neon">
                    <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="min-h-11 w-full bg-transparent py-2.5 text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-2.5 font-medium text-background shadow-neon transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {loading ? "Verificando..." : "Iniciar sesión"}
                </button>
              </form>

              <div className="mt-4 rounded-2xl glass p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Seguridad</p>
                <p className="mt-1">Cierra sesión al terminar si usas un equipo compartido.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
