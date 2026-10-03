import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { ESTADOS_SOLICITUD_MECANICA, ESTADO_SOLICITUD_LABEL, ESTADO_SOLICITUD_TONO } from "./estado-utils";
import type { EstadoSolicitudMecanica } from "@/types/database";

export default async function AdminMecanicaPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("solicitudes_mecanica")
    .select("id, numero, nombre, apellido, telefono, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const estadoFiltro = searchParams.estado as EstadoSolicitudMecanica | undefined;
  if (estadoFiltro && ESTADOS_SOLICITUD_MECANICA.includes(estadoFiltro)) {
    query = query.eq("estado", estadoFiltro);
  }

  const { data: solicitudes } = await query;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-base-white">Turnos de mecánica</h1>
      <p className="mb-6 text-sm text-base-muted">
        Pedidos enviados desde /mecanica. Ninguno se confirma solo: hay que aceptarlo o rechazarlo acá.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/mecanica"
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold",
            !estadoFiltro ? "bg-brand-orange text-white" : "border border-base-border text-base-muted"
          )}
        >
          Todos
        </Link>
        {ESTADOS_SOLICITUD_MECANICA.map((estado) => (
          <Link
            key={estado}
            href={`/admin/mecanica?estado=${estado}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              estadoFiltro === estado ? "bg-brand-orange text-white" : "border border-base-border text-base-muted"
            )}
          >
            {ESTADO_SOLICITUD_LABEL[estado]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="p-3">N°</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(solicitudes ?? []).map((s) => (
              <tr key={s.id} className="border-t border-base-border">
                <td className="p-3 text-base-white">#{s.numero}</td>
                <td className="p-3 text-base-white">
                  {s.nombre} {s.apellido}
                </td>
                <td className="p-3 text-base-muted">{s.telefono}</td>
                <td className="p-3">
                  <Badge tono={ESTADO_SOLICITUD_TONO[s.estado]}>{ESTADO_SOLICITUD_LABEL[s.estado]}</Badge>
                </td>
                <td className="p-3 text-base-muted">{formatFecha(s.created_at)}</td>
                <td className="p-3 text-right">
                  <Link href={`/admin/mecanica/${s.id}`} className="text-brand-orange hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {(solicitudes ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-base-muted">
                  No hay solicitudes{estadoFiltro ? ` con estado "${ESTADO_SOLICITUD_LABEL[estadoFiltro]}"` : ""}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
