import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ScanFace,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/useAuth";
import novatecLogo from "@/assets/novatec-logo.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Acceso admin - Novatec" }, { name: "robots", content: "noindex" }] }),
  component: Login,
});

const accessHighlights = ["Proyectos", "Servicios", "Mensajes", "Perfil"] as const;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState(false);

  useEffect(() => {
    setWebAuthnSupported(!!(window.PublicKeyCredential));
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
    const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error || !data.user) {
      setLoading(false);
      toast.error(error?.message ?? "No se pudo iniciar sesión");
      return;
    }
    const isAdminUser = await checkIsAdmin(data.user.id);
    setLoading(false);
    if (!isAdminUser) {
      await supabase.auth.signOut();
      toast.error("Tu usuario no tiene permisos de administrador");
      return;
    }
    toast.success("Bienvenido al panel admin");
    navigate({ to: "/admin" });
  }

  async function handleBiometric() {
    setBiometricLoading(true);
    try {
      // No se necesita email — el dispositivo elige la passkey guardada (resident key)
      const { data: authData, error: authError } = await supabase.functions.invoke("biometric-auth", {
        body: {},
      });
      if (authError) throw authError;

      const opts = authData.publicKeyCredentialRequestOptions;
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...opts,
          challenge: Uint8Array.from(atob(opts.challenge), (c) => c.charCodeAt(0)),
          allowCredentials: [], // vacío = el dispositivo muestra sus passkeys guardadas
        },
      }) as any;

      if (!assertion) throw new Error("Autenticación cancelada");

      const { data: verifyData, error: verifyError } = await supabase.functions.invoke("biometric-verify", {
        body: {
          credential: {
            id: assertion.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
            response: {
              authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
              signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
              userHandle: assertion.response.userHandle
                ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle)))
                : null,
            },
            type: assertion.type,
          },
        },
      });

      if (verifyError) throw verifyError;
      if (!verifyData?.success) throw new Error(verifyData?.error || "Verificación fallida");

      // Iniciar sesión con el OTP token del magic link
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: verifyData.email,
        token: verifyData.token,
        type: "magiclink",
      });

      if (otpError) throw otpError;

      toast.success("¡Acceso biométrico exitoso!");
      navigate({ to: "/admin" });
    } catch (err: any) {
      if (err.name === "NotAllowedError") toast.error("Autenticación cancelada");
      else if (err.name === "SecurityError") toast.error("Se requiere HTTPS");
      else if (err.message?.includes("no encontrada")) toast.error("No hay passkeys registradas en este dispositivo");
      else toast.error(err.message || "Error en autenticación biométrica");
    } finally {
      setBiometricLoading(false);
    }
  }

  return (
    <div className="admin-shell-bg flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio
        </Link>

        <div className="grid overflow-hidden rounded-2xl surface-panel premium-border lg:grid-cols-[1fr_1.1fr]">
          {/* Panel izquierdo — solo desktop */}
          <section className="relative hidden overflow-hidden border-r border-glass-border p-6 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 grid-bg opacity-35" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <img src={novatecLogo} alt="Logo Novatec" className="h-9 w-9 rounded-xl bg-white object-cover ring-1 ring-glass-border" />
                <div>
                  <p className="font-display text-sm font-semibold">Novatec Admin</p>
                  <p className="text-xs text-muted-foreground">Control del portafolio</p>
                </div>
              </div>
              <div className="mt-8">
                <span className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-neon" />
                  Acceso protegido
                </span>
                <h1 className="mt-3 text-2xl font-bold leading-tight">
                  Gestiona tu web con claridad y rapidez.
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Actualiza contenido, revisa mensajes y mantén tu presencia digital operativa.
                </p>
              </div>
            </div>
            <div className="relative grid grid-cols-4 gap-1.5">
              {accessHighlights.map((item) => (
                <div key={item} className="rounded-xl glass p-2 text-center">
                  <Sparkles className="mx-auto mb-1 h-3 w-3 text-neon" />
                  <p className="text-xs font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Panel derecho — formulario */}
          <section className="p-5 sm:p-6">
            <div className="mx-auto flex w-full max-w-xs flex-col">
              {/* Logo mobile */}
              <div className="mb-4 flex items-center gap-2.5 lg:hidden">
                <img src={novatecLogo} alt="Logo Novatec" className="h-8 w-8 rounded-xl bg-white object-cover ring-1 ring-glass-border" />
                <div>
                  <p className="font-display text-sm font-semibold">Novatec Admin</p>
                  <p className="text-xs text-muted-foreground">Panel de gestión</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3 text-neon" />
                  Sesión administrativa
                </span>
                <h2 className="mt-2.5 text-xl font-bold sm:text-2xl">
                  Accede al <span className="text-gradient">panel</span>
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">Ingresa tus credenciales para continuar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label className="text-xs text-muted-foreground" htmlFor="admin-email">Correo</label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-glass-border bg-input px-3 transition-colors focus-within:border-neon">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="min-h-9 w-full bg-transparent py-2 text-sm outline-none"
                      placeholder="tu@correo.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground" htmlFor="admin-password">Contraseña</label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-glass-border bg-input px-3 transition-colors focus-within:border-neon">
                    <KeyRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="min-h-9 w-full bg-transparent py-2 text-sm outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-neon to-violet px-4 py-2 text-sm font-medium text-background shadow-neon transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                  {loading ? "Verificando..." : "Iniciar sesión"}
                </button>
              </form>

              {/* Biometría */}
              {webAuthnSupported && (
                <>
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-glass-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-surface px-2 text-muted-foreground">O accede con</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometric}
                    disabled={biometricLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-neon/30 bg-neon/5 py-2.5 text-neon transition-all hover:border-neon/60 hover:bg-neon/10 disabled:opacity-50"
                  >
                    {biometricLoading
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <>
                          <Fingerprint className="h-4 w-4" />
                          <ScanFace className="h-4 w-4" />
                        </>
                    }
                    <span className="text-xs font-medium">
                      {biometricLoading ? "Verificando..." : "Huella digital / Face ID"}
                    </span>
                  </button>

                  <p className="mt-1.5 text-center text-xs text-muted-foreground">
                    El dispositivo mostrará tus passkeys guardadas
                  </p>
                </>
              )}

              <div className="mt-3 rounded-xl glass p-2.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Seguridad</p>
                <p className="mt-0.5">Cierra sesión al terminar si usas un equipo compartido.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
