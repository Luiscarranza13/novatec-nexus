import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Upload } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLoader } from "@/components/admin/AdminLoader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/perfil")({
  head: () => ({ meta: [{ title: "Perfil · Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Perfil />
    </AdminGuard>
  ),
});

type PerfilT = {
  id: string;
  nombre: string;
  role: "admin" | "user";
  bio: string;
  avatar_url: string;
  whatsapp: string;
  email_publico: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  github: string;
};

function emptyPerfil(userId: string, email?: string): PerfilT {
  return {
    id: userId,
    nombre: "",
    role: "admin",
    bio: "",
    avatar_url: "",
    whatsapp: "",
    email_publico: email ?? "",
    instagram: "",
    facebook: "",
    linkedin: "",
    github: "",
  };
}

function normalizeOptionalUrl(value: string) {
  const url = value.trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState<PerfilT | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error(error.message);
        setForm((data as PerfilT | null) ?? emptyPerfil(user.id, user.email));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function uploadAvatar(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen valida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Máximo 5MB");
      return;
    }
    try {
      setUploading(true);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const version = Date.now();
      const path = `avatars/${user.id}.${ext}`;
      const { error } = await supabase.storage
        .from("portafolio")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (error) {
        toast.error(error.message);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("portafolio").getPublicUrl(path);
      setForm((f) => (f ? { ...f, avatar_url: `${publicUrl}?v=${version}` } : f));
      toast.success("Avatar actualizado");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const nombre = form.nombre.trim();
    const email = form.email_publico.trim();
    const avatar = normalizeOptionalUrl(form.avatar_url);
    const instagram = normalizeOptionalUrl(form.instagram);
    const facebook = normalizeOptionalUrl(form.facebook);
    const linkedin = normalizeOptionalUrl(form.linkedin);
    const github = normalizeOptionalUrl(form.github);

    if (nombre.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("El email público no es válido");
      return;
    }
    if ([avatar, instagram, facebook, linkedin, github].some((value) => value === null)) {
      toast.error("Las redes y el avatar deben ser URLs http o https");
      return;
    }

    setSaving(true);
    const payload = {
      nombre,
      role: "admin" as const,
      bio: form.bio.trim(),
      avatar_url: avatar || "",
      whatsapp: form.whatsapp.trim(),
      email_publico: email,
      instagram: instagram || "",
      facebook: facebook || "",
      linkedin: linkedin || "",
      github: github || "",
      actualizado_en: new Date().toISOString(),
    };
    const { error } = await supabase.from("perfiles").upsert({ id: form.id, ...payload });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  }

  if (loading || !form) {
    return <AdminLoader label="Cargando perfil..." />;
  }

  return (
    <div>
      <div className="rounded-3xl surface-panel premium-border p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Identidad publica</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Perfil</h1>
        <p className="text-muted-foreground">
          Estos datos controlan la información pública, avatar, contacto y redes de la web.
        </p>
      </div>

      <form onSubmit={save} className="mt-6 max-w-4xl space-y-5 sm:mt-8">
        <div className="surface-panel flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-neon/30 to-violet/30">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full grid place-items-center text-xs text-muted-foreground">
                Avatar
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-4 py-2 text-sm hover:border-neon disabled:opacity-60 sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : "Cambiar avatar"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre público">
            <Inp
              v={form.nombre}
              on={(v) => setForm({ ...form, nombre: v })}
              required
              maxLength={120}
            />
          </Field>
          <Field label="Permiso">
            <input value={form.role} className={inputCls} disabled readOnly />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            value={form.bio ?? ""}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={5}
            maxLength={1200}
            className={inputCls + " resize-none"}
          />
        </Field>
        <Field label="Avatar URL">
          <Inp
            v={form.avatar_url ?? ""}
            on={(v) => setForm({ ...form, avatar_url: v })}
            placeholder="https://..."
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp con codigo de pais">
            <Inp
              v={form.whatsapp ?? ""}
              on={(v) => setForm({ ...form, whatsapp: v })}
              placeholder="+51999999999"
              maxLength={30}
            />
          </Field>
          <Field label="Email público">
            <Inp
              type="email"
              v={form.email_publico ?? ""}
              on={(v) => setForm({ ...form, email_publico: v })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL">
            <Inp
              v={form.instagram ?? ""}
              on={(v) => setForm({ ...form, instagram: v })}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook URL">
            <Inp
              v={form.facebook ?? ""}
              on={(v) => setForm({ ...form, facebook: v })}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="LinkedIn URL">
            <Inp
              v={form.linkedin ?? ""}
              on={(v) => setForm({ ...form, linkedin: v })}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
          <Field label="GitHub URL">
            <Inp
              v={form.github ?? ""}
              on={(v) => setForm({ ...form, github: v })}
              placeholder="https://github.com/..."
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-5 py-2.5 font-medium text-background shadow-neon disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Inp({
  v,
  on,
  placeholder,
  type = "text",
  required,
  maxLength,
}: {
  v: string;
  on: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={v}
      onChange={(e) => on(e.target.value)}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className={inputCls}
    />
  );
}
