import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Upload } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
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
  id: string; nombre: string; rol: string; bio: string;
  avatar_url: string; whatsapp: string; email_publico: string;
  instagram: string; facebook: string; linkedin: string; github: string;
};

function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState<PerfilT | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setForm(data as PerfilT);
      setLoading(false);
    });
  }, [user]);

  async function uploadAvatar(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user!.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portafolio").upload(path, file);
    if (error) { setUploading(false); toast.error(error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("portafolio").getPublicUrl(path);
    setForm((f) => f ? { ...f, avatar_url: publicUrl } : f);
    setUploading(false);
    toast.success("Avatar actualizado");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    const { id, ...payload } = form;
    void id;
    const { error } = await supabase.from("perfiles").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  }

  if (loading || !form) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neon" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Perfil</h1>
      <p className="text-muted-foreground">Tus datos públicos. Aparecen en el sitio.</p>

      <form onSubmit={save} className="mt-8 max-w-2xl space-y-5">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gradient-to-br from-neon/30 to-violet/30">
            {form.avatar_url && <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass hover:border-neon text-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Subiendo..." : "Cambiar avatar"}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre"><Inp v={form.nombre} on={(v) => setForm({ ...form, nombre: v })} /></Field>
          <Field label="Rol"><Inp v={form.rol} on={(v) => setForm({ ...form, rol: v })} /></Field>
        </div>
        <Field label="Bio">
          <textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className={inputCls + " resize-none"} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="WhatsApp (con código país)"><Inp v={form.whatsapp ?? ""} on={(v) => setForm({ ...form, whatsapp: v })} placeholder="+521234567890" /></Field>
          <Field label="Email público"><Inp v={form.email_publico ?? ""} on={(v) => setForm({ ...form, email_publico: v })} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Instagram"><Inp v={form.instagram ?? ""} on={(v) => setForm({ ...form, instagram: v })} placeholder="https://instagram.com/..." /></Field>
          <Field label="Facebook"><Inp v={form.facebook ?? ""} on={(v) => setForm({ ...form, facebook: v })} /></Field>
          <Field label="LinkedIn"><Inp v={form.linkedin ?? ""} on={(v) => setForm({ ...form, linkedin: v })} /></Field>
          <Field label="GitHub"><Inp v={form.github ?? ""} on={(v) => setForm({ ...form, github: v })} /></Field>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium disabled:opacity-60 glow-neon">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar cambios
        </button>
      </form>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
function Inp({ v, on, placeholder }: { v: string; on: (v: string) => void; placeholder?: string }) {
  return <input value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} className={inputCls} />;
}
