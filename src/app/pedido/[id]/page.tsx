import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { formatPrecio } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Confirmación de pedido. Se busca por el UUID exacto del pedido (128 bits
 * de entropía, no listable ni adivinable) con el cliente de service role,
 * igual que un link de confirmación de Stripe/Mercado Pago: conocer el UUID
 * de ESTE pedido es la credencial. Esto evita depender de RLS por
 * usuario_id, que no puede distinguir "invitado dueño del pedido" de
 * "cualquier invitado" porque ambos tienen usuario_id = null.
 */
export default async function PedidoConfirmadoPage({ params }: { params: { id: string } }) {
  const uuidValido = /^[0-9a-f-]{36}$/i.test(params.id);
  if (!uuidValido) notFound();

  const supabase = createAdminClient();
  const { data: pedido } = await supabase.from("pedidos").select("*").eq("id", params.id).maybeSingle();
  if (!pedido) notFound();

  const { data: items } = await supabase.from("pedido_items").select("*").eq("pedido_id", pedido.id);
  const config = await getConfiguracion();

  const mensaje = `Hola Moto Plus Talar, hice el pedido #${pedido.numero} y quiero coordinar el pago/entrega.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h1 className="text-2xl font-bold text-base-white">¡Pedido recibido!</h1>
        <p className="mt-1 text-sm text-base-muted">
          Pedido #{pedido.numero} · Te vamos a contactar para coordinar el pago y la entrega.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-base-border bg-base-surface p-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-orange">
          Detalle del pedido
        </h2>
        <ul className="flex flex-col gap-2">
          {(items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-base-white">
                {item.cantidad}x {item.nombre_producto}
              </span>
              <span className="text-base-muted">{formatPrecio(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-base-border pt-4 text-sm">
          <div className="flex justify-between text-base-muted">
            <span>Subtotal</span>
            <span>{formatPrecio(pedido.subtotal)}</span>
          </div>
          <div className="flex justify-between text-base-muted">
            <span>Envío</span>
            <span>{formatPrecio(pedido.costo_envio)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-base-white">
            <span>Total</span>
            <span>{formatPrecio(pedido.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={whatsappLink(config, mensaje)} target="_blank" className="flex-1" size="lg">
          Coordinar por WhatsApp
        </ButtonLink>
        <ButtonLink href="/productos" variant="secondary" className="flex-1" size="lg">
          Seguir comprando
        </ButtonLink>
      </div>

      <p className="mt-6 text-center text-xs text-base-muted">
        Guardá esta página o el link para volver a ver tu pedido:{" "}
        <Link href={`/pedido/${pedido.id}`} className="underline">
          motoplustalar.com.ar/pedido/{pedido.id}
        </Link>
      </p>
    </div>
  );
}
