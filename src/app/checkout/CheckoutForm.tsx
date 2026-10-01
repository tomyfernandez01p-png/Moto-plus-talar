"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrecio } from "@/lib/format";
import type { Configuracion } from "@/lib/config";
import type { MetodoPago, TipoEntrega } from "@/types/database";
import { crearPedidoAction } from "./actions";

const METODOS_PAGO_LABEL: Record<MetodoPago, string> = {
  mercadopago: "Mercado Pago (tarjeta, dinero en cuenta, etc.)",
  transferencia: "Transferencia bancaria (Banco Nación o Banco Provincia)",
  efectivo: "Efectivo (al retirar / recibir)",
  tarjeta: "Tarjeta",
};

const inputClass =
  "w-full rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange";

export function CheckoutForm({ config }: { config: Configuracion }) {
  const { items, subtotal, vaciar } = useCart();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const envioActivo = config.metodos_envio?.envio_activo !== false;
  const retiroActivo = config.metodos_envio?.retiro_activo !== false;
  const costoEnvioFijo = config.metodos_envio?.costo_envio_fijo ?? null;
  const envioGratisDesde = config.metodos_envio?.envio_gratis_desde ?? null;

  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(
    retiroActivo ? "retiro_local" : "envio"
  );

  const metodosDisponibles = (["mercadopago", "transferencia", "efectivo"] as const).filter(
    (m) => config.metodos_pago?.[m]
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago | undefined>(metodosDisponibles[0]);

  // Esto es solo para mostrarle un total estimado al comprador antes de
  // confirmar: el costo de envío real lo vuelve a calcular `crear_pedido`
  // en el servidor a partir de esta misma configuración y del subtotal ya
  // validado con los precios reales de la base (ver 0010_crear_pedido_
  // costo_envio_servidor.sql). Lo que se manda acá en `costoEnvio` nunca se
  // usa para el total del pedido, el servidor lo ignora.
  const envioGratis =
    tipoEntrega === "envio" && envioGratisDesde != null && subtotal >= envioGratisDesde;
  const costoEnvio = tipoEntrega === "envio" && !envioGratis ? costoEnvioFijo ?? 0 : 0;
  const total = subtotal + costoEnvio;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setEnviando(true);

    const resultado = await crearPedidoAction({
      nombre: String(form.get("nombre") || ""),
      apellido: String(form.get("apellido") || ""),
      email: String(form.get("email") || ""),
      telefono: String(form.get("telefono") || ""),
      dniCuit: String(form.get("dniCuit") || ""),
      tipoEntrega,
      direccion: String(form.get("direccion") || ""),
      ciudad: String(form.get("ciudad") || ""),
      provincia: String(form.get("provincia") || ""),
      codigoPostal: String(form.get("codigoPostal") || ""),
      costoEnvio,
      metodoPago,
      items: items.map((i) => ({ producto_id: i.productoId, cantidad: i.cantidad })),
    });

    if (!resultado.ok) {
      setEnviando(false);
      setError(resultado.error);
      return;
    }

    vaciar();

    if (metodoPago === "mercadopago") {
      try {
        const respuesta = await fetch("/api/mercadopago/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pedidoId: resultado.pedidoId }),
        });
        const datos = await respuesta.json();
        if (datos.ok && datos.initPoint) {
          window.location.href = datos.initPoint;
          return;
        }
        // Mercado Pago no está configurado (o falló): el pedido ya se generó
        // igual, así que seguimos a la confirmación para coordinar por
        // WhatsApp en vez de dejar al cliente sin ninguna respuesta.
        console.error("mercadopago:crear-preferencia", datos.error);
      } catch (err) {
        console.error("mercadopago:crear-preferencia", err);
      }
    }

    setEnviando(false);
    router.push(`/pedido/${resultado.pedidoId}`);
  }

  if (items.length === 0) {
    return <p className="text-sm text-base-muted">Tu carrito está vacío.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">Tus datos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="nombre" required placeholder="Nombre" className={inputClass} />
          <input name="apellido" required placeholder="Apellido" className={inputClass} />
          <input name="email" type="email" required placeholder="Email" className={inputClass} />
          <input name="telefono" required placeholder="Teléfono" className={inputClass} />
          <input name="dniCuit" placeholder="DNI / CUIT (opcional)" className={inputClass} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">Entrega</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          {retiroActivo && (
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 text-sm ${tipoEntrega === "retiro_local" ? "border-brand-orange bg-brand-orange/10" : "border-base-border"}`}>
              <input
                type="radio"
                name="tipoEntregaRadio"
                className="sr-only"
                checked={tipoEntrega === "retiro_local"}
                onChange={() => setTipoEntrega("retiro_local")}
              />
              <span className="font-semibold text-base-white">Retiro en el local</span>
              <p className="mt-1 text-xs text-base-muted">
                {config.direccion}, {config.ciudad} · {config.horarios?.lunes_viernes}
              </p>
            </label>
          )}
          {envioActivo && (
            <label className={`flex-1 cursor-pointer rounded-xl border p-4 text-sm ${tipoEntrega === "envio" ? "border-brand-orange bg-brand-orange/10" : "border-base-border"}`}>
              <input
                type="radio"
                name="tipoEntregaRadio"
                className="sr-only"
                checked={tipoEntrega === "envio"}
                onChange={() => setTipoEntrega("envio")}
              />
              <span className="font-semibold text-base-white">Envío a domicilio</span>
              <p className="mt-1 text-xs text-base-muted">
                {envioGratis
                  ? "¡Envío gratis!"
                  : costoEnvioFijo != null
                  ? formatPrecio(costoEnvioFijo)
                  : "Costo a coordinar por WhatsApp"}
              </p>
            </label>
          )}
        </div>

        {tipoEntrega === "envio" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="direccion" required placeholder="Dirección" className={`sm:col-span-2 ${inputClass}`} />
            <input name="ciudad" required placeholder="Ciudad" className={inputClass} />
            <input name="provincia" required placeholder="Provincia" className={inputClass} />
            <input name="codigoPostal" placeholder="Código postal" className={inputClass} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-orange">Resumen</h2>
        <div className="flex justify-between text-sm text-base-muted">
          <span>Subtotal</span>
          <span>{formatPrecio(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-base-muted">
          <span>Envío</span>
          <span>
            {tipoEntrega === "envio"
              ? envioGratis
                ? "Gratis"
                : costoEnvioFijo != null
                ? formatPrecio(costoEnvioFijo)
                : "A coordinar"
              : "—"}
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t border-base-border pt-2 text-base font-bold text-base-white">
          <span>Total</span>
          <span>{formatPrecio(total)}</span>
        </div>
      </section>

      {metodosDisponibles.length > 0 ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">Medio de pago</h2>
          <div className="flex flex-col gap-2">
            {metodosDisponibles.map((metodo) => (
              <label
                key={metodo}
                className={`cursor-pointer rounded-xl border p-3 text-sm ${
                  metodoPago === metodo ? "border-brand-orange bg-brand-orange/10" : "border-base-border"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPagoRadio"
                  className="sr-only"
                  checked={metodoPago === metodo}
                  onChange={() => setMetodoPago(metodo)}
                />
                <span className="font-semibold text-base-white">{METODOS_PAGO_LABEL[metodo]}</span>
              </label>
            ))}
          </div>
          {metodoPago === "mercadopago" ? (
            <p className="text-xs text-base-muted">Vas a pagar en el sitio seguro de Mercado Pago.</p>
          ) : (
            <p className="text-xs text-base-muted">
              Te confirmamos los datos para coordinar el pago por WhatsApp o email una vez generado
              el pedido.
            </p>
          )}
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-base-border p-4 text-xs text-base-muted">
          El pago se coordina por WhatsApp o email una vez generado el pedido.
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-xl bg-brand-orange py-4 text-base font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {enviando ? "Generando pedido…" : "Confirmar pedido"}
      </button>
    </form>
  );
}
