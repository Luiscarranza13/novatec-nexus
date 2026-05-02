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

    async function applySession(s: Session | null) {
      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        const admin = await checkIsAdmin(s.user.id);
        if (active) setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }

      if (active) setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setLoading(true);
      void applySession(s);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      void applySession(s);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, isAdmin, loading };
}
