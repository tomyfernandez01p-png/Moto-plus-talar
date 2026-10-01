import { createClient } from "@/lib/supabase/server";
import { formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export default async function AdminClientesPage() {
  const supabase = createClient();

  const { data: clientes } = await supabase
    .from("perfiles")
    .select("id, nombre, apellido, telefono, dni_cuit, activo, created_at")
    .eq("rol", "cliente")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-base-white">Clientes</h1>
      <p className="mb-6 text-sm text-base-muted">
        Cuentas registradas por clientes en la tienda. {clientes?.length ?? 0} en total.
      </p>

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">DNI / CUIT</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Alta</th>
            </tr>
          </thead>
          <tbody>
            {(clientes ?? []).map((c) => (
              <tr key={c.id} className="border-t border-base-border">
                <td className="p-3 text-base-white">
                  {c.nombre || c.apellido ? `${c.nombre ?? ""} ${c.apellido ?? ""}`.trim() : "Sin nombre"}
                </td>
                <td className="p-3 text-base-muted">{c.telefono || "—"}</td>
                <td className="p-3 text-base-muted">{c.dni_cuit || "—"}</td>
                <td className="p-3">
                  <Badge tono={c.activo ? "success" : "danger"}>
                    {c.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="p-3 text-base-muted">{formatFecha(c.created_at)}</td>
              </tr>
            ))}
            {(clientes ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-base-muted">
                  Todavía no hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
