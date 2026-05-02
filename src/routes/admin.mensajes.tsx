import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2, Mail, MailOpen, Inbox } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/mensajes")({
  head: () => ({ meta: [{ title: "Mensajes · Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Mensajes />
    </AdminGuard>
  ),
});

type Mensaje = { id: string; nombre: string; correo: string; mensaje: string; leido: boolean; creado_en: string };

function Mensajes() {
  const [items, setItems] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("mensajes").select("*").order("creado_en", { ascending: false });
    setLoading(false);
    if (error) toast.error(error.message);
    else setItems((data as Mensaje[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function toggleLeido(m: Mensaje) {
    const { error } = await supabase.from("mensajes").update({ leido: !m.leido }).eq("id", m.id);
    if (error) toast.error(error.message);
    else load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este mensaje?")) return;
    const { error } = await supabase.from("mensajes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Mensajes</h1>
      <p className="text-muted-foreground">Mensajes recibidos desde el formulario de contacto.</p>

      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-neon" /></div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-muted-foreground mt-6 flex flex-col items-center gap-3">
          <Inbox className="h-10 w-10 text-neon/60" />
          Aún no has recibido mensajes.
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {items.map((m) => (
            <div key={m.id} className={`glass rounded-2xl p-5 ${!m.leido ? "border-neon/40" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!m.leido && <span className="h-2 w-2 rounded-full bg-neon shadow-neon" />}
                    <h3 className="font-semibold">{m.nombre}</h3>
                    <a href={`mailto:${m.correo}`} className="text-xs text-neon hover:underline">{m.correo}</a>
                  </div>
                  <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">{m.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(m.creado_en).toLocaleString("es-MX")}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => toggleLeido(m)} className="p-2 rounded-lg glass hover:border-neon" title={m.leido ? "Marcar como no leído" : "Marcar como leído"}>
                    {m.leido ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-neon" />}
                  </button>
                  <button onClick={() => remove(m.id)} className="p-2 rounded-lg glass hover:border-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
