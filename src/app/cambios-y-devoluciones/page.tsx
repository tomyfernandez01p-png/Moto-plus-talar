import type { Metadata } from "next";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Cambios y devoluciones" };

export default async function CambiosPage() {
  const config = await getConfiguracion();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 text-sm text-base-muted">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Cambios y devoluciones</h1>
      <p className="mb-4">
        Si el producto que recibiste tiene un problema o no es el que necesitabas, escribinos por
        WhatsApp con el número de pedido dentro de los 10 días de recibido para coordinar el
        cambio o la devolución.
      </p>
      <p className="mb-6">
        El producto debe estar sin uso, en su empaque original y con el comprobante de compra.
      </p>
      <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank">
        Consultar por WhatsApp
      </ButtonLink>
    </div>
  );
}
