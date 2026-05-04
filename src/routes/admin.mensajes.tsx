import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Inbox, Loader2, Mail, MailOpen, RefreshCw, Search, Trash2 } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLoader } from "@/components/admin/AdminLoader";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/mensajes")({
  head: () => ({ meta: [{ title: "Mensajes · Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Mensajes />
    </AdminGuard>
  ),
});

type Mensaje = {
  id: string;
  nombre: string;
  correo: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
};

function Mensajes() {
  const [items, setItems] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "sin-leer" | "leidos">("todos");

  const unread = useMemo(() => items.filter((m) => !m.leido).length, [items]);
  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((message) => {
      const matchesTerm =
        !term ||
        [message.nombre, message.correo, message.mensaje].join(" ").toLowerCase().includes(term);
      const matchesFilter =
        filter === "todos" ||
        (filter === "sin-leer" && !message.leido) ||
        (filter === "leidos" && message.leido);
      return matchesTerm && matchesFilter;
    });
  }, [filter, items, query]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("mensajes")
      .select("*")
      .order("creado_en", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Mensaje[]) ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleLeido(m: Mensaje) {
    setBusyId(m.id);
    const next = !m.leido;
    const { error } = await supabase.from("mensajes").update({ leido: next }).eq("id", m.id);
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      setItems((current) =>
        current.map((item) => (item.id === m.id ? { ...item, leido: next } : item)),
      );
      toast.success(next ? "Marcado como leído" : "Marcado como no leído");
    }
  }

  async function remove(m: Mensaje) {
    if (!confirm(`Eliminar el mensaje de ${m.nombre}?`)) return;
    setBusyId(m.id);
    const { error } = await supabase.from("mensajes").delete().eq("id", m.id);
    setBusyId(null);
    if (error) toast.error(error.message);
    else {
      setItems((current) => current.filter((item) => item.id !== m.id));
      toast.success("Mensaje eliminado");
    }
  }

  return (
    <div>
      <div className="rounded-3xl surface-panel premium-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Bandeja</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Mensajes</h1>
            <p className="text-muted-foreground">
              Mensajes recibidos desde contacto. Sin leer: {unread}
            </p>
          </div>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 hover:border-neon disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="glass flex items-center gap-2 rounded-2xl px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Buscar por nombre, correo o mensaje"
          />
        </label>
        <div className="grid grid-cols-3 gap-2 rounded-2xl glass p-1">
          {[
            ["todos", "Todos"],
            ["sin-leer", "Sin leer"],
            ["leidos", "Leídos"],
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
        <AdminLoader label="Cargando mensajes..." />
      ) : visibleItems.length === 0 ? (
        <div className="surface-panel mt-6 flex flex-col items-center gap-3 rounded-2xl p-10 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 text-neon/60" />
          No hay mensajes para esta vista.
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {visibleItems.map((m) => (
            <article
              key={m.id}
              className={`surface-panel rounded-2xl p-4 sm:p-5 ${!m.leido ? "border-neon/40" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!m.leido && <span className="h-2 w-2 rounded-full bg-neon shadow-neon" />}
                    <h3 className="font-semibold">{m.nombre}</h3>
                    <a href={`mailto:${m.correo}`} className="text-xs text-neon hover:underline">
                      {m.correo}
                    </a>
                  </div>
                  <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap break-words">
                    {m.mensaje}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(m.creado_en).toLocaleString("es-PE")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                  <button
                    onClick={() => toggleLeido(m)}
                    disabled={busyId === m.id}
                    className="inline-flex items-center justify-center rounded-lg glass p-2 hover:border-neon disabled:opacity-60"
                    title={m.leido ? "Marcar como no leído" : "Marcar como leído"}
                  >
                    {busyId === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : m.leido ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4 text-neon" />
                    )}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    disabled={busyId === m.id}
                    className="inline-flex items-center justify-center rounded-lg glass p-2 hover:border-destructive hover:text-destructive disabled:opacity-60"
                    aria-label={`Eliminar mensaje de ${m.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
