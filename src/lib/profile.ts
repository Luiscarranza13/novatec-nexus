export const ADMIN_PROFILE_FILTER = { column: "role", value: "admin" } as const;

type PublicProfileCandidate = {
  avatar_url?: string | null;
  nombre?: string | null;
};

export function pickPublicProfile<T extends PublicProfileCandidate>(
  profiles: T[] | null | undefined,
) {
  if (!profiles?.length) return null;

  return (
    profiles.find((profile) => profile.avatar_url?.trim()) ??
    profiles.find((profile) => profile.nombre && profile.nombre !== "Admin Novatec") ??
    profiles[0]
  );
}
