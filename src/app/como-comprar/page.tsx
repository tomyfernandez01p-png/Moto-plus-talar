import type { Metadata } from "next";
import Link from "next/link";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description: "El proceso de compra en Moto Plus Talar, paso a paso.",
};

const PASOS = [
  {
    titulo: "Confirmás tu pedido",
    texto:
      "Realizá tu pedido a través de nuestra tienda o directamente por WhatsApp. Confirmamos la disponibilidad de stock y coordinamos la compra.",
  },
  {
    titulo: "Elegís tu medio de pago",
    texto:
      "Aceptamos transferencia bancaria, efectivo y tarjetas de crédito en hasta 3 pagos sin interés, según las promociones bancarias vigentes.",
    link: { href: "/formas-de-pago", texto: "Ver formas de pago y promociones" },
  },
  {
    titulo: "Preparamos tu pedido",
    texto:
      "Una vez confirmado el pago y la disponibilidad del producto, preparamos tu pedido para su entrega o despacho.",
  },
  {
    titulo: "Recibís tu compra",
    texto:
      "Coordinamos el envío según tu ubicación o podés retirar tu pedido por nuestro local. Revisá tu compra al recibirla; ante cualquier inconveniente, contactanos para que podamos asesorarte.",
    link: { href: "/envios", texto: "Ver plazos y costos de envío" },
  },
];

export default async function ComoComprarPage() {
  const config = await getConfiguracion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-base-muted md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Cómo comprar</h1>

      <ol className="mb-8 flex flex-col gap-4">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="flex gap-4 rounded-2xl border border-base-border bg-base-dark p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-base font-extrabold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="text-base font-bold text-base-white">{p.titulo}</h2>
              <p className="mt-1">{p.texto}</p>
              {p.link && (
                <Link href={p.link.href} className="mt-2 inline-block font-semibold text-brand-orange underline-offset-2 hover:underline">
                  {p.link.texto}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mb-6">
        ¿Preferís pagar en efectivo? También podés abonar contra entrega en nuestro local Moto Plus
        Talar. Para consultas sobre stock, medios de pago y envíos, escribinos por WhatsApp.
      </p>

      <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank">
        Escribinos por WhatsApp
      </ButtonLink>
    </div>
  );
}
