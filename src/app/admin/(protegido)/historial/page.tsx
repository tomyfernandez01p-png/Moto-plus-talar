import { createClient } from "@/lib/supabase/server";
import { formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

const ACCION_TONO: Record<string, "orange" | "neutral" | "success" | "danger"> = {
  insert: "success",
  update: "orange",
  delete: "danger",
};

export default async function AdminHistorialPage() {
  const supabase = createClient();

  const { data: cambios } = await supabase
    .from("historial_cambios")
    .select("id, tabla, registro_id, usuario_id, accion, campo, valor_anterior, valor_nuevo, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const usuarioIds = Array.from(
    new Set((cambios ?? []).map((c) => c.usuario_id).filter((id): id is string => Boolean(id)))
  );

  const { data: perfiles } =
    usuarioIds.length > 0
      ? await supabase.from("perfiles").select("id, nombre, apellido").in("id", usuarioIds)
      : { data: [] };

  const nombrePorUsuario = new Map(
    (perfiles ?? []).map((p) => [p.id, `${p.nombre ?? ""} ${p.apellido ?? ""}`.trim() || "—"])
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-base-white">Historial / auditoría</h1>
      <p className="mb-6 text-sm text-base-muted">
        Registro de cambios realizados en el catálogo, pedidos y configuración.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="p-3">Fecha</th>
              <th className="p-3">Tabla</th>
              <th className="p-3">Acción</th>
              <th className="p-3">Campo</th>
              <th className="p-3">Antes → Después</th>
              <th className="p-3">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {(cambios ?? []).map((c) => (
              <tr key={c.id} className="border-t border-base-border align-top">
                <td className="whitespace-nowrap p-3 text-base-muted">{formatFecha(c.created_at)}</td>
                <td className="p-3 text-base-white">{c.tabla}</td>
                <td className="p-3">
                  <Badge tono={ACCION_TONO[c.accion] ?? "neutral"}>{c.accion}</Badge>
                </td>
                <td className="p-3 text-base-muted">{c.campo || "—"}</td>
                <td className="max-w-xs p-3 text-base-muted">
                  {c.valor_anterior || c.valor_nuevo ? (
                    <span className="break-words">
                      {c.valor_anterior ?? "—"} → {c.valor_nuevo ?? "—"}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 text-base-muted">
                  {c.usuario_id ? nombrePorUsuario.get(c.usuario_id) ?? "—" : "Sistema"}
                </td>
              </tr>
            ))}
            {(cambios ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-base-muted">
                  Todavía no hay movimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
