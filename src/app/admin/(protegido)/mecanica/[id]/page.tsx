import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { waLinkParaTelefono } from "@/lib/whatsapp";
import { ESTADOS_SOLICITUD_MECANICA, ESTADO_SOLICITUD_LABEL, ESTADO_SOLICITUD_TONO } from "../estado-utils";
import { actualizarEstadoSolicitudMecanicaAction, guardarNotaSolicitudMecanicaAction } from "../actions";

export default async function AdminMecanicaDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: solicitud } = await supabase
    .from("solicitudes_mecanica")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!solicitud) notFound();

  const [{ data: servicios }, { data: historial }] = await Promise.all([
    supabase.from("servicios_mecanica").select("id, nombre").in("id", solicitud.servicios_ids),
    supabase
      .from("historial_cambios")
      .select("*")
      .eq("tabla", "solicitudes_mecanica")
      .eq("registro_id", solicitud.id)
      .order("created_at", { ascending: false }),
  ]);

  async function guardarEstado(formData: FormData) {
    "use server";
    await actualizarEstadoSolicitudMecanicaAction(solicitud!.id, formData);
  }
  async function guardarNota(formData: FormData) {
    "use server";
    await guardarNotaSolicitudMecanicaAction(solicitud!.id, formData);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/mecanica" className="text-xs text-base-muted hover:text-base-white">
            ← Volver a turnos de mecánica
          </Link>
          <h1 className="text-2xl font-bold text-base-white">Solicitud #{solicitud.numero}</h1>
          <span className="text-sm text-base-muted">{formatFecha(solicitud.created_at)}</span>
        </div>
        <Badge tono={ESTADO_SOLICITUD_TONO[solicitud.estado]}>
          {ESTADO_SOLICITUD_LABEL[solicitud.estado]}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Cliente</h2>
          <p className="text-base-white">
            {solicitud.nombre} {solicitud.apellido}
          </p>
          <p className="text-sm text-base-muted">{solicitud.telefono}</p>
          {solicitud.email && <p className="text-sm text-base-muted">{solicitud.email}</p>}
          <a
            href={waLinkParaTelefono(
              solicitud.telefono,
              `Hola ${solicitud.nombre}, te escribimos por tu pedido de turno de mecánica #${solicitud.numero}.`
            )}
            target="_blank"
            className="mt-2 inline-block text-sm text-brand-orange hover:underline"
          >
            Escribir por WhatsApp
          </a>
        </section>

        <section className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Moto</h2>
          {solicitud.moto_marca || solicitud.moto_modelo ? (
            <p className="text-base-white">
              {solicitud.moto_marca} {solicitud.moto_modelo}
            </p>
          ) : (
            <p className="text-sm text-base-muted">No especificada.</p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-base-border bg-base-surface p-4">
        <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Servicios pedidos</h2>
        <ul className="flex flex-wrap gap-2">
          {(servicios ?? []).map((s) => (
            <li key={s.id} className="rounded-full border border-base-border px-3 py-1 text-sm text-base-white">
              {s.nombre}
            </li>
          ))}
          {(servicios ?? []).length === 0 && <li className="text-sm text-base-muted">—</li>}
        </ul>
        {solicitud.descripcion_problema && (
          <p className="mt-3 text-sm text-base-muted">
            <span className="font-semibold text-base-white">Problema descripto: </span>
            {solicitud.descripcion_problema}
          </p>
        )}
      </section>

      {solicitud.repuesto_cliente && (
        <section className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase text-amber-300">
            Repuesto elegido por el cliente (registrado)
          </h2>
          <p className="text-sm text-base-white">{solicitud.repuesto_cliente}</p>
          <p className="mt-1 text-xs text-base-muted">
            Pedido el {solicitud.repuesto_cliente_registrado_at ? formatFecha(solicitud.repuesto_cliente_registrado_at) : "—"}.
            El cliente aceptó la confirmación de condiciones el{" "}
            {solicitud.disclaimer_aceptado_at ? formatFecha(solicitud.disclaimer_aceptado_at) : "—"}: este
            registro queda como respaldo ante cualquier reclamo posterior por el repuesto elegido.
          </p>
        </section>
      )}

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Cambiar estado</h2>
          <form action={guardarEstado} className="flex flex-col gap-3">
            <select
              name="estado"
              defaultValue={solicitud.estado}
              className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white"
            >
              {ESTADOS_SOLICITUD_MECANICA.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_SOLICITUD_LABEL[estado]}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white">
              Actualizar estado
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Notas internas</h2>
          <form action={guardarNota} className="flex flex-col gap-3">
            <textarea
              name="notasInternas"
              defaultValue={solicitud.notas_internas ?? ""}
              rows={3}
              placeholder="Notas visibles solo para el equipo"
              className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white"
            />
            <button className="rounded-lg border border-base-border px-4 py-2 text-sm font-semibold text-base-white">
              Guardar nota
            </button>
          </form>
        </div>
      </section>

      {historial && historial.length > 0 && (
        <section className="mt-6 rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Historial de cambios</h2>
          <div className="flex flex-col gap-2">
            {historial.map((h) => (
              <div key={h.id} className="text-sm text-base-muted">
                <span className="text-base-white">{formatFecha(h.created_at)}</span> —{" "}
                {h.campo === "estado" ? (
                  <>
                    Estado cambiado de <strong className="text-base-white">{h.valor_anterior}</strong> a{" "}
                    <strong className="text-base-white">{h.valor_nuevo}</strong>
                  </>
                ) : (
                  `${h.accion} (${h.campo ?? "-"})`
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
