import type { Metadata } from "next";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Cambios, devoluciones y garantía" };

export default async function CambiosPage() {
  const config = await getConfiguracion();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 text-sm text-base-muted">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Cambios, devoluciones y garantía</h1>
      <p className="mb-4">
        Si el producto que recibiste tiene un problema o no es el que necesitabas, escribinos por
        WhatsApp con el número de pedido dentro de los 10 días de recibido para coordinar el
        cambio o la devolución.
      </p>
      <p className="mb-6">
        El producto debe estar sin uso, en su empaque original y con el comprobante de compra.
      </p>
      <h2 className="mb-3 text-lg font-bold text-base-white">¿Qué garantía tienen nuestros productos?</h2>
      <p className="mb-4">
        En Moto Plus Talar, la garantía de los repuestos cubre exclusivamente los defectos de
        fabricación, sujetos a la evaluación correspondiente.
      </p>
      <p className="mb-6">
        La garantía no cubre daños ocasionados por mal uso, instalación incorrecta, golpes, caídas,
        desgaste natural, manipulación o modificaciones del producto, ni fallas derivadas de una
        instalación o utilización inadecuada.
      </p>

      <div className="mb-6 rounded-2xl border border-brand-orange/50 bg-base-dark p-5">
        <h2 className="mb-2 text-base font-bold text-base-white">Productos eléctricos y electrónicos</h2>
        <p>
          Los productos eléctricos y electrónicos no tienen cambio ni devolución, sin excepción. Te
          recomendamos verificar la compatibilidad y el funcionamiento de la instalación antes de
          realizar la compra.
        </p>
      </div>

      <h2 className="mb-3 text-lg font-bold text-base-white">¿Cómo solicitar la garantía?</h2>
      <p className="mb-4">
        Para iniciar una solicitud por un posible defecto de fabricación, es necesario presentar el
        comprobante de compra. El producto será evaluado para determinar si corresponde la cobertura.
      </p>
      <p className="mb-6">
        Importante: la garantía no cubre fallas ocasionadas por causas ajenas a defectos de
        fabricación. Ante cualquier consulta, acercate a Moto Plus Talar. Estamos para asesorarte.
      </p>

      <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank">
        Consultar por WhatsApp
      </ButtonLink>
    </div>
  );
}
