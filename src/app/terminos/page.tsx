import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default async function TerminosPage() {
  const config = await getConfiguracion();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 text-sm text-base-muted">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Términos y condiciones</h1>
      <p className="mb-4">
        Al comprar en {config.nombre_negocio} aceptás estos términos. Los precios y la
        disponibilidad de stock se muestran en tiempo real y pueden actualizarse sin previo aviso.
      </p>
      <p className="mb-4">
        Las ofertas tienen vigencia según la fecha indicada en cada producto. Una vez confirmado
        el pago, el pedido pasa a preparación según el estado informado en tu cuenta o por
        WhatsApp.
      </p>
      <p>
        Ante cualquier duda sobre tu compra, contactanos por WhatsApp o al email{" "}
        {config.email}.
      </p>
    </div>
  );
}
