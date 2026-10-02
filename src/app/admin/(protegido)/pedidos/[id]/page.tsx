import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrecio, formatFecha } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { waLinkParaTelefono } from "@/lib/whatsapp";
import { ESTADOS_PEDIDO, ESTADO_LABEL, ESTADO_TONO } from "../estado-utils";
import { actualizarEstadoPedidoAction, guardarNotaPedidoAction } from "../actions";

interface DireccionEnvio {
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
}

export default async function AdminPedidoDetallePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: pedido } = await supabase.from("pedidos").select("*").eq("id", params.id).single();
  if (!pedido) notFound();

  const [{ data: items }, { data: pagos }, { data: historial }] = await Promise.all([
    supabase.from("pedido_items").select("*").eq("pedido_id", pedido.id).order("id"),
    supabase.from("pagos").select("*").eq("pedido_id", pedido.id).order("created_at", { ascending: false }),
    supabase
      .from("historial_cambios")
      .select("*")
      .eq("tabla", "pedidos")
      .eq("registro_id", pedido.id)
      .order("created_at", { ascending: false }),
  ]);

  const direccion = pedido.direccion_envio as DireccionEnvio | null;

  async function guardarEstado(formData: FormData) {
    "use server";
    await actualizarEstadoPedidoAction(pedido!.id, formData);
  }
  async function guardarNota(formData: FormData) {
    "use server";
    await guardarNotaPedidoAction(pedido!.id, formData);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/pedidos" className="text-xs text-base-muted hover:text-base-white">
            ← Volver a pedidos
          </Link>
          <h1 className="text-2xl font-bold text-base-white">Pedido #{pedido.numero}</h1>
          <span className="text-sm text-base-muted">{formatFecha(pedido.created_at)}</span>
        </div>
        <Badge tono={ESTADO_TONO[pedido.estado]}>{ESTADO_LABEL[pedido.estado]}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Cliente</h2>
          <p className="text-base-white">
            {pedido.nombre} {pedido.apellido}
          </p>
          <p className="text-sm text-base-muted">{pedido.email}</p>
          <p className="text-sm text-base-muted">{pedido.telefono}</p>
          {pedido.dni_cuit && <p className="text-sm text-base-muted">DNI/CUIT: {pedido.dni_cuit}</p>}
          <a
            href={waLinkParaTelefono(
              pedido.telefono,
              `Hola ${pedido.nombre}, te escribimos por tu pedido #${pedido.numero}.`
            )}
            target="_blank"
            className="mt-2 inline-block text-sm text-brand-orange hover:underline"
          >
            Escribir por WhatsApp
          </a>
        </section>

        <section className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Entrega</h2>
          <p className="text-base-white">{pedido.tipo_entrega === "envio" ? "Envío a domicilio" : "Retiro en local"}</p>
          {pedido.tipo_entrega === "envio" && direccion && (
            <p className="text-sm text-base-muted">
              {direccion.direccion}, {direccion.ciudad}, {direccion.provincia}
              {direccion.codigo_postal ? ` (CP ${direccion.codigo_postal})` : ""}
            </p>
          )}
          <p className="mt-2 text-sm text-base-muted">
            Método de pago: {pedido.metodo_pago ?? "No especificado"}
          </p>
        </section>
      </div>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Código</th>
              <th className="p-3 text-right">Precio unit.</th>
              <th className="p-3 text-right">Cant.</th>
              <th className="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className="border-t border-base-border">
                <td className="p-3 text-base-white">{item.nombre_producto}</td>
                <td className="p-3 text-base-muted">{item.codigo ?? "—"}</td>
                <td className="p-3 text-right text-base-white">{formatPrecio(item.precio_unitario)}</td>
                <td className="p-3 text-right text-base-white">{item.cantidad}</td>
                <td className="p-3 text-right text-base-white">{formatPrecio(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-base-border text-base-white">
            <tr>
              <td colSpan={4} className="p-3 text-right text-base-muted">
                Subtotal
              </td>
              <td className="p-3 text-right">{formatPrecio(pedido.subtotal)}</td>
            </tr>
            {pedido.descuento > 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-right text-base-muted">
                  Descuento
                </td>
                <td className="p-3 text-right">-{formatPrecio(pedido.descuento)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={4} className="p-3 text-right text-base-muted">
                Envío
              </td>
              <td className="p-3 text-right">
                {pedido.costo_envio > 0 ? formatPrecio(pedido.costo_envio) : "Gratis / Retiro"}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="p-3 text-right font-bold">
                Total
              </td>
              <td className="p-3 text-right font-bold">{formatPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {pagos && pagos.length > 0 && (
        <section className="mt-6 rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Pagos</h2>
          <div className="flex flex-col gap-2">
            {pagos.map((pago) => (
              <div key={pago.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-base-white">
                  {pago.proveedor} · {formatPrecio(pago.monto)}
                </span>
                <Badge tono={pago.estado === "aprobado" ? "success" : pago.estado === "rechazado" ? "danger" : "neutral"}>
                  {pago.estado}
                </Badge>
                <span className="text-xs text-base-muted">{formatFecha(pago.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-base-border bg-base-surface p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-base-muted">Cambiar estado</h2>
          <form action={guardarEstado} className="flex flex-col gap-3">
            <select
              name="estado"
              defaultValue={pedido.estado}
              className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white"
            >
              {ESTADOS_PEDIDO.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABEL[estado]}
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
              name="notas"
              defaultValue={pedido.notas ?? ""}
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
