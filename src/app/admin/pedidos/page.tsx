import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrecio, formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ESTADOS_PEDIDO, ESTADO_LABEL, ESTADO_TONO } from "./estado-utils";
import type { EstadoPedido } from "@/types/database";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("pedidos")
    .select("id, numero, nombre, apellido, tipo_entrega, total, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const estadoFiltro = searchParams.estado as EstadoPedido | undefined;
  if (estadoFiltro && ESTADOS_PEDIDO.includes(estadoFiltro)) {
    query = query.eq("estado", estadoFiltro);
  }

  const { data: pedidos } = await query;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-base-white">Pedidos</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            !estadoFiltro ? "bg-brand-orange text-white" : "border border-base-border text-base-muted"
          )}
        >
          Todos
        </Link>
        {ESTADOS_PEDIDO.map((estado) => (
          <Link
            key={estado}
            href={`/admin/pedidos?estado=${estado}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              estadoFiltro === estado ? "bg-brand-orange text-white" : "border border-base-border text-base-muted"
            )}
          >
            {ESTADO_LABEL[estado]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="p-3">N°</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Entrega</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(pedidos ?? []).map((p) => (
              <tr key={p.id} className="border-t border-base-border">
                <td className="p-3 text-base-white">#{p.numero}</td>
                <td className="p-3 text-base-white">
                  {p.nombre} {p.apellido}
                </td>
                <td className="p-3 text-base-muted">
                  {p.tipo_entrega === "envio" ? "Envío" : "Retiro en local"}
                </td>
                <td className="p-3 text-right text-base-white">{formatPrecio(p.total)}</td>
                <td className="p-3">
                  <Badge tono={ESTADO_TONO[p.estado]}>{ESTADO_LABEL[p.estado]}</Badge>
                </td>
                <td className="p-3 text-base-muted">{formatFecha(p.created_at)}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/pedidos/${p.id}`} className="text-brand-orange hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {(pedidos ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-base-muted">
                  No hay pedidos{estadoFiltro ? ` con estado "${ESTADO_LABEL[estadoFiltro]}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
