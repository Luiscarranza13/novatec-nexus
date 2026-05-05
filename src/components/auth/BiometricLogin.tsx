import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Fingerprint, ScanFace, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/useAuth";

interface BiometricLoginProps {
  email: string;
  onSuccess: () => void;
}

export function BiometricLogin({ email, onSuccess }: BiometricLoginProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const available = !!(window.PublicKeyCredential);
    setIsAvailable(available);
    setIsSupported(available);

    if (email && available) {
      checkBiometricRegistration(email);
    }
  }, [email]);

  async function checkBiometricRegistration(userEmail: string) {
    try {
      const { data, error } = await supabase
        .from("credenciales_biometricas")
        .select("id")
        .eq("correo_usuario", userEmail.toLowerCase().trim())
        .eq("activa", true);

      if (error) throw error;
      setIsRegistered(data && data.length > 0);
    } catch (err) {
      console.error("[Biometric] Error verificando registro:", err);
    }
  }

  async function handleBiometricLogin() {
    if (!email) {
      toast.error("Por favor ingresa tu correo primero");
      return;
    }

    setIsLoading(true);

    try {
      // Obtener el desafío del backend
      const { data: authData, error: authError } = await supabase.functions.invoke(
        'biometric-auth',
        {
          body: { email: email.trim().toLowerCase() },
        }
      );

      if (authError) throw authError;
      if (!authData?.publicKeyCredentialRequestOptions) {
        throw new Error("Configuración biométrica no disponible");
      }

      // Decodificar las opciones
      const options = {
        ...authData.publicKeyCredentialRequestOptions,
        challenge: Uint8Array.from(atob(authData.publicKeyCredentialRequestOptions.challenge), c => c.charCodeAt(0)),
        allowCredentials: authData.publicKeyCredentialRequestOptions.allowCredentials?.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
        })),
      };

      // Solicitar autenticación biométrica
      const assertion = await navigator.credentials.get({ publicKey: options });

      if (!assertion) {
        throw new Error("Autenticación cancelada");
      }

      // Verificar la respuesta en el backend
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'biometric-verify',
        {
          body: {
            email: email.trim().toLowerCase(),
            credential: {
              id: assertion.id,
              rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
              response: {
                authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
                clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
                signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))),
                userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))) : null,
              },
              type: assertion.type,
            },
          },
        }
      );

      if (verifyError) throw verifyError;

      if (verifyData?.success) {
        // Iniciar sesión normal después de verificación biométrica
        const normalizedEmail = email.trim().toLowerCase();
        
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: verifyData.tempToken, // Token temporal o contraseña almacenada
        });

        if (signInError) throw signInError;

        const admin = await checkIsAdmin(data.user.id);
        if (!admin) {
          await supabase.auth.signOut();
          toast.error("Tu usuario no tiene permisos de administrador");
          return;
        }

        toast.success("¡Autenticación biométrica exitosa!");
        onSuccess();
      } else {
        throw new Error(verifyData?.message || "Autenticación fallida");
      }
    } catch (err: any) {
      console.error("[Biometric] Error:", err);
      
      if (err.name === 'NotAllowedError') {
        toast.error("Autenticación cancelada");
      } else if (err.name === 'NotReadableError') {
        toast.error("Sensor biométrico no disponible");
      } else if (err.name === 'SecurityError') {
        toast.error("Error de seguridad en conexión HTTPS");
      } else if (err.message?.includes("timeout")) {
        toast.error("Tiempo de espera agotado");
      } else {
        toast.error(err.message || "Error en autenticación biométrica");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterBiometric() {
    if (!email) {
      toast.error("Por favor ingresa tu correo primero");
      return;
    }

    setIsLoading(true);

    try {
      // Obtener opciones de registro del backend
      const { data: regData, error: regError } = await supabase.functions.invoke(
        'biometric-register',
        {
          body: { 
            email: email.trim().toLowerCase(),
            userName: email.trim().toLowerCase().split('@')[0]
          },
        }
      );

      if (regError) throw regError;
      if (!regData?.publicKeyCredentialCreationOptions) {
        throw new Error("No se pudo iniciar el registro biométrico");
      }

      // Preparar opciones
      const options = {
        ...regData.publicKeyCredentialCreationOptions,
        challenge: Uint8Array.from(atob(regData.publicKeyCredentialCreationOptions.challenge), c => c.charCodeAt(0)),
        user: {
          ...regData.publicKeyCredentialCreationOptions.user,
          id: Uint8Array.from(atob(regData.publicKeyCredentialCreationOptions.user.id), c => c.charCodeAt(0)),
        },
        excludeCredentials: regData.publicKeyCredentialCreationOptions.excludeCredentials?.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
        })),
      };

      // Crear nueva credencial
      const credential = await navigator.credentials.create({ publicKey: options });

      if (!credential) {
        throw new Error("Registro cancelado");
      }

      // Registrar la credencial en el backend
      const { data: saveData, error: saveError } = await supabase.functions.invoke(
        'biometric-save',
        {
          body: {
            email: email.trim().toLowerCase(),
            credential: {
              id: credential.id,
              rawId: btoa(String.fromCharCode(...new Uint8Array((credential as any).rawId))),
              response: {
                clientDataJSON: btoa(String.fromCharCode(...new Uint8Array((credential as any).response.clientDataJSON))),
                attestationObject: btoa(String.fromCharCode(...new Uint8Array((credential as any).response.attestationObject))),
              },
              type: credential.type,
            },
          },
        }
      );

      if (saveError) throw saveError;

      toast.success("Huella/Face ID registrada exitosamente");
      setIsRegistered(true);
    } catch (err: any) {
      console.error("[Biometric] Error registro:", err);
      
      if (err.name === 'NotAllowedError') {
        toast.error("Registro cancelado");
      } else if (err.name === 'InvalidStateError') {
        toast.error("Ya existe una credencial para este usuario");
      } else if (err.name === 'SecurityError') {
        toast.error("Se requiere conexión HTTPS para biometría");
      } else {
        toast.error(err.message || "Error al registrar credencial");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAvailable) {
    return (
      <div className="rounded-2xl glass p-4">
        <div className="flex items-center gap-3 text-amber-500">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Tu navegador no soporta autenticación biométrica</p>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="rounded-2xl glass p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm">Biometría disponible en dispositivos móviles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass p-4">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-neon" />
        <span className="font-medium">Seguridad Biométrica</span>
      </div>

      {!isRegistered ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Registra tu huella digital o Face ID para acceso rápido y seguro.
          </p>
          <button
            type="button"
            onClick={handleRegisterBiometric}
            disabled={isLoading || !email}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neon/30 bg-neon/5 px-4 py-3 text-neon transition-all hover:bg-neon/10 hover:border-neon/50 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? (
                  <ScanFace className="h-5 w-5" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
              </>
            )}
            {isLoading ? "Registrando..." : "Registrar Biométrica"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Usa tu huella digital o Face ID para iniciar sesión rápido.
          </p>
          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={isLoading || !email}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neon/30 bg-neon/5 px-4 py-3 text-neon transition-all hover:bg-neon/10 hover:border-neon/50 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <>
                {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? (
                  <ScanFace className="h-5 w-5" />
                ) : (
                  <Fingerprint className="h-5 w-5" />
                )}
              </>
            )}
            {isLoading ? "Verificando..." : "Desbloquear con Biometría"}
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Solo para usuarios administradores
          </p>
        </div>
      )}
    </div>
  );
}
