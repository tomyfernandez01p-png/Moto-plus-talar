import type { Metadata } from "next";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Formas de pago y promociones",
  description:
    "Formas de pago de Moto Plus Talar: transferencia o efectivo con 10 % de descuento, QR, débito y crédito, y promociones bancarias.",
};

export default async function FormasDePagoPage() {
  const config = await getConfiguracion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-base-muted md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Formas de pago y promociones</h1>

      <section className="mb-8 flex flex-col gap-3">
        <div className="rounded-2xl border border-brand-orange/50 bg-base-dark p-5">
          <h2 className="text-lg font-bold text-base-white">Efectivo o transferencia: 10 % de descuento</h2>
          <p className="mt-1">
            Pagando en efectivo o por transferencia bancaria tenés un 10 % de descuento sobre el precio
            publicado. También podés abonar en efectivo contra entrega en nuestro local.
          </p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-dark p-5">
          <h2 className="text-lg font-bold text-base-white">QR, débito y crédito en 1 pago</h2>
          <p className="mt-1">Precio publicado.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-base-white">Promociones bancarias</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-base-border bg-base-dark p-5">
            <h3 className="mb-2 font-bold text-base-white">Banco Francés</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <span className="font-semibold text-base-white">Martes: </span>
                30 % de devolución pagando en 1 pago con tarjetas de crédito (tope de $12.000 por
                persona).
              </li>
              <li>
                <span className="font-semibold text-base-white">Viernes y sábados: </span>3 cuotas sin
                interés.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-base-border bg-base-dark p-5">
            <h3 className="mb-2 font-bold text-base-white">Banco Provincia</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <span className="font-semibold text-base-white">Todos los días: </span>3 cuotas sin
                interés.
              </li>
              <li>
                <span className="font-semibold text-base-white">Cuenta DNI: </span>
                20 % de devolución (tope de $6.000 por cuenta por semana).
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-3">
          Los topes y beneficios los define cada banco. Consultá las promociones disponibles antes de
          realizar tu compra.
        </p>
      </section>

      <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank">
        Consultar medios de pago por WhatsApp
      </ButtonLink>
    </div>
  );
}
