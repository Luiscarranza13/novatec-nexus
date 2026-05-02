import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/servicios")({
  head: () => ({ meta: [{ title: "Servicios · Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <ServiciosAdmin />
    </AdminGuard>
  ),
});

type Servicio = { id: string; titulo: string; descripcion: string; icono: string; orden: number };
const empty: Omit<Servicio, "id"> = { titulo: "", descripcion: "", icono: "Sparkles", orden: 0 };

function ServiciosAdmin() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("servicios").select("*").order("orden");
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Servicio[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("¿Eliminar?")) return;
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">Lo que ofreces a tus clientes.</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium glow-neon">
          <Plus className="h-4 w-4" /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neon" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((s) => {
            const Icon = ((Icons as unknown as Record<string, LucideIcon>)[s.icono] ?? Sparkles) as LucideIcon;
            return (
              <div key={s.id} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon/20 to-violet/20 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-neon" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{s.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.descripcion}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(s)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg glass hover:border-neon">
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button onClick={() => remove(s.id)} className="px-3 py-2 text-xs rounded-lg glass hover:border-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <Modal
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function Modal({ initial, isNew, onClose, onSaved }: { initial: Servicio; isNew: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) { toast.error("Título requerido"); return; }
    setSaving(true);
    const payload = { titulo: form.titulo, descripcion: form.descripcion, icono: form.icono || "Sparkles", orden: form.orden };
    const { error } = isNew
      ? await supabase.from("servicios").insert(payload)
      : await supabase.from("servicios").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success(isNew ? "Creado" : "Actualizado"); onSaved(); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="glass rounded-3xl p-6 w-full max-w-md space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{isNew ? "Nuevo servicio" : "Editar servicio"}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">Título</span>
          <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Descripción</span>
          <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm resize-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Icono (lucide)</span>
            <input value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })} placeholder="Code2, Brain, Smartphone..." className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm" />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Orden</span>
            <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} className="mt-1 w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm" />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Iconos disponibles: <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="text-neon hover:underline">lucide.dev/icons</a></p>
        <button type="submit" disabled={saving} className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2 glow-neon">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
      </form>
    </div>
  );
}
