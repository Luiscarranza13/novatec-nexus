import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Fingerprint, ScanFace, Trash2, Plus, ShieldCheck, Loader2, Smartphone, Monitor } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { swal } from "@/lib/swal";

export const Route = createFileRoute("/admin/biometric/")({
  component: BiometricPage,
});

interface Passkey {
  id: string;
  id_credencial: string;
  tipo_dispositivo: string | null;
  creada_en: string;
  ultimo_uso: string | null;
}

function BiometricPage() {
  const { user } = useAuth();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => { if (user) loadPasskeys(); }, [user]);

  async function loadPasskeys() {
    const { data } = await supabase
      .from("credenciales_biometricas")
      .select("id, id_credencial, tipo_dispositivo, creada_en, ultimo_uso")
      .eq("id_usuario", user!.id)
      .eq("activa", true)
      .order("creada_en", { ascending: false });
    setPasskeys(data || []);
    setLoading(false);
  }

  async function handleRegister() {
    if (!user?.email) return;
    setRegistering(true);
    try {
      const { data, error } = await supabase.functions.invoke("biometric-register", {
        body: { email: user.email, userName: user.user_metadata?.full_name || user.email.split("@")[0] },
      });
      if (error) throw error;

      const opts = data.publicKeyCredentialCreationOptions;
      const credential = await navigator.credentials.create({
        publicKey: {
          ...opts,
          challenge: Uint8Array.from(atob(opts.challenge), (c) => c.charCodeAt(0)),
          user: {
            ...opts.user,
            id: Uint8Array.from(atob(opts.user.id), (c) => c.charCodeAt(0)),
          },
          excludeCredentials: opts.excludeCredentials?.map((c: any) => ({
            ...c,
            id: Uint8Array.from(atob(c.id), (ch) => ch.charCodeAt(0)),
          })),
        },
      });

      if (!credential) throw new Error("Registro cancelado");

      const { error: saveError } = await supabase.functions.invoke("biometric-save", {
        body: {
          email: user.email,
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array((credential as any).rawId))),
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array((credential as any).response.clientDataJSON))),
              attestationObject: btoa(String.fromCharCode(...new Uint8Array((credential as any).response.attestationObject))),
              transports: (credential as any).response.getTransports?.() || [],
            },
            type: credential.type,
          },
        },
      });

      if (saveError) throw saveError;
      await swal.success("Passkey registrada", "Ya puedes usarla para iniciar sesión");
      loadPasskeys();    } catch (err: any) {
      if (err.name === "NotAllowedError") swal.error("Registro cancelado");
      else if (err.name === "InvalidStateError") swal.error("Dispositivo ya registrado", "Este dispositivo ya tiene una passkey registrada");
      else if (err.name === "SecurityError") swal.error("Se requiere HTTPS");
      else swal.error("Error", err.message || "Error al registrar passkey");
    } finally {
      setRegistering(false);
    }
  }

  async function handleDelete(id: string) {
    const result = await swal.confirm({
      title: "¿Eliminar passkey?",
      text: "Ya no podrás usarla para iniciar sesión.",
      confirmText: "Eliminar",
    });
    if (!result.isConfirmed) return;
    const { error } = await supabase
      .from("credenciales_biometricas")
      .update({ activa: false })
      .eq("id", id)
      .eq("id_usuario", user!.id);
    if (error) { swal.error("Error al eliminar"); return; }
    await swal.success("Passkey eliminada");
    setPasskeys((prev) => prev.filter((p) => p.id !== id));
  }

  const isSupported = !!(window.PublicKeyCredential);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-neon" />
            Llaves de acceso (Passkeys)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura tu huella digital o Face ID como llave de acceso al panel. Una vez registrada, podrás iniciar sesión sin contraseña.
          </p>
        </div>

        {!isSupported && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
            Tu navegador no soporta passkeys (WebAuthn). Usa Chrome, Safari o Edge actualizado.
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Registrar nueva passkey</CardTitle>
            <CardDescription className="text-xs">
              Al hacer clic, tu dispositivo te pedirá verificar tu identidad con huella digital, Face ID o PIN del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRegister}
              disabled={registering || !isSupported}
              size="sm"
              className="gap-2"
            >
              {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {registering ? "Registrando..." : "Agregar passkey"}
            </Button>
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
              <li>• Funciona con huella digital (Android, Windows Hello)</li>
              <li>• Funciona con Face ID / Touch ID (iPhone, Mac)</li>
              <li>• Puedes registrar múltiples dispositivos</li>
              <li>• Requiere HTTPS en producción</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Passkeys registradas</CardTitle>
            <CardDescription className="text-xs">Dispositivos configurados para acceso biométrico</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
              </div>
            ) : passkeys.length === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-6 text-center">
                <Fingerprint className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No hay passkeys registradas</p>
                <p className="text-xs text-muted-foreground">Agrega una para acceder sin contraseña</p>
              </div>
            ) : (
              <div className="space-y-2">
                {passkeys.map((pk) => (
                  <div key={pk.id} className="flex items-center justify-between rounded-lg border border-glass-border p-3">
                    <div className="flex items-center gap-3">
                      {pk.tipo_dispositivo === "platform"
                        ? <ScanFace className="h-5 w-5 text-neon shrink-0" />
                        : <Fingerprint className="h-5 w-5 text-violet-400 shrink-0" />
                      }
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {pk.tipo_dispositivo === "platform" ? "Face ID / Huella digital" : "Llave de seguridad"}
                          </p>
                          <Badge variant="outline" className="text-xs py-0">
                            {pk.tipo_dispositivo === "platform"
                              ? <><Smartphone className="h-3 w-3 mr-1" />Dispositivo</>
                              : <><Monitor className="h-3 w-3 mr-1" />Externo</>
                            }
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Registrada: {new Date(pk.creada_en).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                          {pk.ultimo_uso && ` · Último uso: ${new Date(pk.ultimo_uso).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pk.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
