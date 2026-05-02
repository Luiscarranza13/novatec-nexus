import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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

const suggestedIcons = ["Sparkles", "Code2", "Brain", "Smartphone", "Globe", "Database"];

function getIcon(name: string) {
  return ((Icons as unknown as Record<string, LucideIcon>)[name] ?? Sparkles) as LucideIcon;
}

function ServiciosAdmin() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("servicios").select("*").order("orden");
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Servicio[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(service: Servicio) {
    if (!confirm(`Eliminar el servicio "${service.titulo}"?`)) return;
    setDeletingId(service.id);
    const { error } = await supabase.from("servicios").delete().eq("id", service.id);
    setDeletingId(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Servicio eliminado");
      await load();
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-3xl surface-panel premium-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Oferta</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Servicios</h1>
            <p className="text-muted-foreground">Controla los servicios visibles en la web.</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-4 py-2.5 font-medium text-background shadow-neon sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Nuevo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-neon" />
        </div>
      ) : items.length === 0 ? (
        <div className="surface-panel rounded-2xl p-10 text-center text-muted-foreground">
          Aun no hay servicios.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
          {items.map((s) => {
            const Icon = getIcon(s.icono);
            return (
              <article key={s.id} className="surface-panel rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-neon/20 to-violet/20 grid place-items-center shrink-0">
                    <Icon className="h-5 w-5 text-neon" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{s.titulo}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.descripcion}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Icono: {s.icono} · Orden: {s.orden}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <button
                    onClick={() => setEditing(s)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg glass hover:border-neon"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() => remove(s)}
                    disabled={deletingId === s.id}
                    className="px-3 py-2 text-xs rounded-lg glass hover:border-destructive hover:text-destructive disabled:opacity-60"
                    aria-label={`Eliminar ${s.titulo}`}
                  >
                    {deletingId === s.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <Modal
          initial={editing ?? { ...empty, id: "" }}
          isNew={creating}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function Modal({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: Servicio;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const IconPreview = useMemo(() => getIcon(form.icono), [form.icono]);

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const titulo = form.titulo.trim();
    const descripcion = form.descripcion.trim();
    const icono = form.icono.trim() || "Sparkles";
    const orden = Number.isFinite(form.orden) ? form.orden : 0;

    if (titulo.length < 2) {
      toast.error("El titulo debe tener al menos 2 caracteres");
      return;
    }
    if (descripcion.length < 10) {
      toast.error("La descripcion debe tener al menos 10 caracteres");
      return;
    }
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(icono)) {
      toast.error("El icono debe ser un nombre valido de Lucide, por ejemplo Sparkles");
      return;
    }

    setSaving(true);
    const payload = { titulo, descripcion, icono, orden };
    const { error } = isNew
      ? await supabase.from("servicios").insert(payload)
      : await supabase.from("servicios").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(isNew ? "Servicio creado" : "Servicio actualizado");
      onSaved();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-background/70 p-3 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={() => !saving && onClose()}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="surface-panel max-h-[92vh] w-full max-w-md overflow-auto rounded-3xl p-4 space-y-3 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {isNew ? "Nuevo servicio" : "Editar servicio"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1 rounded-lg hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">Titulo</span>
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            className={inputCls}
            maxLength={120}
            required
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">Descripcion</span>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            className={inputCls + " resize-none"}
            maxLength={800}
            required
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-muted-foreground">Icono</span>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-9 w-9 shrink-0 rounded-lg glass grid place-items-center">
                <IconPreview className="h-4 w-4 text-neon" />
              </div>
              <input
                value={form.icono}
                onChange={(e) => setForm({ ...form, icono: e.target.value })}
                placeholder="Sparkles"
                className={inputCls}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Orden</span>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
              className={inputCls}
              min={0}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setForm({ ...form, icono: icon })}
              className="px-2 py-1 rounded-lg glass text-xs hover:border-neon"
            >
              {icon}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2 glow-neon"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
        </button>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm";
