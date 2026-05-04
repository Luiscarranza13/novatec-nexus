import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Upload,
  Star,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLoader } from "@/components/admin/AdminLoader";
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
  id: string;
  nombre: string;
  descripcion: string;
  imagen_url: string | null;
  link: string | null;
  categoria: string;
  destacado: boolean;
  orden: number;
};

const empty: Omit<Proyecto, "id"> = {
  nombre: "",
  descripcion: "",
  imagen_url: "",
  link: "",
  categoria: "Web",
  destacado: false,
  orden: 0,
};

function normalizeUrl(value: string | null) {
  const url = value?.trim();
  if (!url || url === "#") return "";
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function ProyectosAdmin() {
  const [items, setItems] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "destacados" | "sin-imagen">("todos");

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((project) => {
      const matchesTerm =
        !term ||
        [project.nombre, project.descripcion, project.categoria]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchesFilter =
        filter === "todos" ||
        (filter === "destacados" && project.destacado) ||
        (filter === "sin-imagen" && !project.imagen_url);
      return matchesTerm && matchesFilter;
    });
  }, [items, query, filter]);

  const featuredCount = useMemo(() => items.filter((project) => project.destacado).length, [items]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("proyectos").select("*").order("orden");
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Proyecto[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(project: Proyecto) {
    if (!confirm(`Eliminar el proyecto "${project.nombre}"?`)) return;
    setDeletingId(project.id);
    const { error } = await supabase.from("proyectos").delete().eq("id", project.id);
    setDeletingId(null);
    if (error) toast.error(error.message);
    else {
      toast.success("Proyecto eliminado");
      await load();
    }
  }

  return (
    <div>
      <div className="mb-6 rounded-3xl surface-panel premium-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Portafolio</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Proyectos</h1>
            <p className="text-muted-foreground">
              {items.length} proyectos, {featuredCount} destacados.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 hover:border-neon disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon to-violet px-4 py-2.5 font-medium text-background shadow-neon sm:w-auto"
            >
              <Plus className="h-4 w-4" /> Nuevo
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="glass flex items-center gap-2 rounded-2xl px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar por nombre, categoria o descripcion"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 rounded-2xl glass p-1">
          {[
            ["todos", "Todos"],
            ["destacados", "Destacados"],
            ["sin-imagen", "Sin imagen"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as typeof filter)}
              className={`rounded-xl px-3 py-2 text-xs transition-colors ${
                filter === value ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AdminLoader label="Cargando proyectos..." />
      ) : filteredItems.length === 0 ? (
        <div className="surface-panel rounded-2xl p-10 text-center text-muted-foreground">
          No hay proyectos para esta búsqueda.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {filteredItems.map((p) => (
            <article key={p.id} className="surface-panel overflow-hidden rounded-2xl">
              <div className="aspect-[16/10] bg-gradient-to-br from-violet/30 to-neon/20">
                {p.imagen_url ? (
                  <img
                    src={p.imagen_url}
                    alt={p.nombre}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full grid place-items-center text-muted-foreground text-sm">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-neon uppercase tracking-wider">{p.categoria}</span>
                  {p.destacado && <Star className="h-4 w-4 text-neon fill-neon" />}
                </div>
                <h3 className="font-semibold mt-1">{p.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.descripcion}</p>
                <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
                  {p.link ? (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-lg glass px-3 py-2 text-xs hover:border-neon"
                    >
                      <ExternalLink className="h-3 w-3" /> Ver
                    </a>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-lg glass px-3 py-2 text-xs text-muted-foreground">
                      Sin link
                    </span>
                  )}
                  <button
                    onClick={() => setEditing(p)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg glass hover:border-neon"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </button>
                  <button
                    onClick={() => remove(p)}
                    disabled={deletingId === p.id}
                    className="px-3 py-2 text-xs rounded-lg glass hover:border-destructive hover:text-destructive disabled:opacity-60"
                    aria-label={`Eliminar ${p.nombre}`}
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ProyectoModal
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

function ProyectoModal({
  initial,
  isNew,
  onClose,
  onSaved,
}: {
  initial: Proyecto;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canClose = !saving && !uploading;

  async function uploadImage(file: File) {
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
      const path = `proyectos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("portafolio")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) {
        toast.error(error.message);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("portafolio").getPublicUrl(path);
      setForm((f) => ({ ...f, imagen_url: publicUrl }));
      toast.success("Imagen subida");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();

    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const categoria = form.categoria.trim();
    const link = normalizeUrl(form.link);
    const imageUrl = normalizeUrl(form.imagen_url);
    const orden = Number.isFinite(form.orden) ? form.orden : 0;

    if (nombre.length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres");
      return;
    }
    if (descripcion.length < 10) {
      toast.error("La descripcion debe tener al menos 10 caracteres");
      return;
    }
    if (categoria.length < 2) {
      toast.error("La categoria es requerida");
      return;
    }
    if (link === null) {
      toast.error("El link debe ser una URL http o https");
      return;
    }
    if (imageUrl === null) {
      toast.error("La imagen debe ser una URL http o https");
      return;
    }

    setSaving(true);
    const payload = {
      nombre,
      descripcion,
      imagen_url: imageUrl || "",
      link: link || "",
      categoria,
      destacado: form.destacado,
      orden,
    };
    const { error } = isNew
      ? await supabase.from("proyectos").insert(payload)
      : await supabase.from("proyectos").update(payload).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(isNew ? "Proyecto creado" : "Proyecto actualizado");
      onSaved();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-background/70 p-3 backdrop-blur-sm sm:place-items-center sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && canClose) onClose();
      }}
    >
      <form
        onSubmit={save}
        onClick={(e) => e.stopPropagation()}
        className="surface-panel max-h-[92vh] w-full max-w-lg overflow-auto rounded-3xl p-4 space-y-3 sm:max-h-[90vh] sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {isNew ? "Nuevo proyecto" : "Editar proyecto"}
          </h2>
          <button
            type="button"
            onClick={() => canClose && onClose()}
            disabled={!canClose}
            className="p-1 rounded-lg hover:bg-white/5"
            aria-label="Cerrar formulario"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Field label="Nombre" help="Visible como titulo del proyecto.">
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className={inputCls}
            maxLength={120}
            required
          />
        </Field>
        <Field label="Descripción" help="Mínimo 10 caracteres.">
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            rows={4}
            className={inputCls + " resize-none"}
            maxLength={1000}
            required
          />
        </Field>

        <Field label="Imagen" help="Puedes subir una imagen o pegar una URL.">
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {form.imagen_url && (
                <img src={form.imagen_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl glass px-3 py-2 text-sm hover:border-neon"
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {uploading ? "Subiendo..." : "Subir imagen"}
              </button>
            </div>
            <input
              value={form.imagen_url ?? ""}
              onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
              className={inputCls}
              placeholder="https://..."
            />
          </div>
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Categoria">
            <input
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className={inputCls}
              maxLength={60}
              required
            />
          </Field>
          <Field label="Orden">
            <input
              type="number"
              value={form.orden}
              onChange={(e) =>
                setForm({ ...form, orden: e.target.value === "" ? 0 : Number(e.target.value) })
              }
              className={inputCls}
              min={0}
            />
          </Field>
        </div>

        <Field label="Link del proyecto" help="Opcional. Debe iniciar con http o https.">
          <input
            value={form.link ?? ""}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className={inputCls}
            placeholder="https://..."
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.destacado}
            onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
            className="accent-neon"
          />
          Destacado
        </label>

        <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
          <button
            type="button"
            onClick={() => canClose && onClose()}
            disabled={!canClose}
            className="rounded-xl glass px-4 py-2.5 text-sm hover:border-neon disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon to-violet text-background font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2 glow-neon"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar proyecto
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-input border border-glass-border focus:border-neon focus:outline-none text-sm";

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
      {help && <span className="mt-1 block text-[11px] text-muted-foreground">{help}</span>}
    </label>
  );
}
