import { useEffect, useState } from "react";
import novatecLogo from "@/assets/novatec-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PROFILE_FILTER, pickPublicProfile } from "@/lib/profile";

type LoaderProfile = {
  avatar_url: string | null;
  nombre: string | null;
};

export function AdminLoader({ label = "Cargando panel..." }: { label?: string }) {
  const [profile, setProfile] = useState<LoaderProfile | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("perfiles")
      .select("avatar_url,nombre")
      .eq(ADMIN_PROFILE_FILTER.column, ADMIN_PROFILE_FILTER.value)
      .order("actualizado_en", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (active) setProfile(pickPublicProfile(data as LoaderProfile[] | null));
      });

    return () => {
      active = false;
    };
  }, []);

  const image = profile?.avatar_url || novatecLogo;
  const name = profile?.nombre || "Novatec";

  return (
    <div className="grid min-h-[48vh] place-items-center px-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute -inset-5 rounded-full bg-foreground/10 blur-xl admin-loader-pulse" />
          <div className="absolute -inset-2 rounded-[2rem] border border-neon/40 admin-loader-orbit" />
          <div className="relative grid h-22 w-22 place-items-center rounded-[1.7rem] glass shadow-elevated">
            <img
              src={image}
              alt={name}
              className="h-16 w-16 rounded-2xl bg-white object-cover ring-1 ring-glass-border"
            />
          </div>
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-background bg-neon shadow-neon" />
        </div>
        <p className="mt-5 font-display text-lg font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">Preparando tu panel administrativo</p>
        <div className="mt-4 h-1.5 w-44 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-foreground admin-loader-bar" />
        </div>
      </div>
    </div>
  );
}
