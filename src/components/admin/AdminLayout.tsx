import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLoader } from "@/components/admin/AdminLoader";
import { AdminGuard } from "@/components/admin/AdminGuard";

export function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="admin-shell-bg min-h-screen">
        <AdminLoader label="Validando acceso..." />
      </div>
    );
  }

  if (!user || !isAdmin) {
    toast.error("No tienes permisos de administrador");
    void supabase.auth.signOut();
    return (
      <div className="admin-shell-bg min-h-screen">
        <AdminLoader label="Redirigiendo..." />
      </div>
    );
  }

  return <AdminGuard>{children}</AdminGuard>;
}
