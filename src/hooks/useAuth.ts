import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function checkIsAdmin(userId: string) {
  const { data, error } = await supabase
    .from("perfiles")
    .select("role")
    .eq("id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.error("[Auth] Error verificando rol admin:", error);
    return false;
  }

  return data?.role === "admin";
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function applySession(s: Session | null, isInitialLoad = false) {
      if (isInitialLoad) setLoading(true);

      if (!s?.user) {
        if (!active) return;
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const admin = await checkIsAdmin(s.user.id);

      if (!active) return;
      setSession(s);
      setUser(s.user);
      setIsAdmin(admin);
      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      void applySession(s);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      void applySession(s, true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}
