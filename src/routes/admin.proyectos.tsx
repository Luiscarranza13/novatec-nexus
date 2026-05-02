import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Upload, Star } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/proyectos")({
  head: () => ({ meta: [{ title: "Proyectos · Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <ProyectosAdmin />
    </AdminGuard>
  ),
});

type Proyecto = {
  id: string; nombre: string; descripcion: string;
  imagen_url: string | null; link: string | null;
  categoria: string; destacado: boolean; orden: number;
};

const empty: Omit<Proyecto, "id"> = {
  nombre: "", descripcion: "", imagen_url: "",
  link: "", categoria: "Web", destacado: false, orden: 0,
};

function ProyectosAdmin() {
  const [items, setItems] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("proyectos").select("*").order("orden");
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Proyecto[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">Gestiona tu portafolio público.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium glow-neon"
        >
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neon" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground">Aún no hay proyectos.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.id} className="glass rounded-2xl overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-violet/30 to-neon/20">
                {p.imagen_url && <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" loading="lazy" />}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neon uppercase tracking-wider">{p.categoria}</span>
                  {p.destacado && <Star className="h-4 w-4 text-neon fill-neon" />}
                </div>
                <h3 className="font-semibold mt-1">{p.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.descripcion}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(p)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg glass hover:border-neon">
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => remove(p.id)} className="px-3 py-2 text-xs rounded-lg glass hover:border-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ProyectoModal
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function ProyectoModal({
  initial, isNew, onClose, onSaved,
}: { initial: Proyecto; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `proyectos/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("portafolio").upload(path, file, { upsert: false });
    if (error) { setUploading(false); toast.error(error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("portafolio").getPublicUrl(path);
    setForm((f) => ({ ...f, imagen_url: publicUrl }));
    setUploading(false);
    toast.success("Imagen subida");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error("Nombre requerido"); return; }
    setSaving(true);
    const payload = {
      nombre: form.nombre, descripcion: form.descripcion,
      imagen_url: form.imagen_url, link: form.link,
      categoria: form.categoria, destacado: form.destacado, orden: form.orden,
    };
    const { error } = isNew
      ? await supabase.from("proyectos").insert(payload)
      : await supabase.from("proyectos").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(isNew ? "Creado" : "Actualizado"); onSaved(); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{isNew ? "Nuevo proyecto" : "Editar proyecto"}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>

        <Field label="Nombre">
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Descripción">
          <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className={inputCls + " resize-none"} />
        </Field>

        <Field label="Imagen">
          <div className="flex gap-2 items-center">
            {form.imagen_url && <img src={form.imagen_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass hover:border-neon text-sm">
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {uploading ? "Subiendo..." : "Subir imagen"}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoría">
            <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Orden">
            <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>

        <Field label="Link (URL)">
          <input value={form.link ?? ""} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputCls} placeholder="https://..." />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} className="accent-neon" />
          Destacado
        </label>

        <button type="submit" disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2 glow-neon">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar
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
