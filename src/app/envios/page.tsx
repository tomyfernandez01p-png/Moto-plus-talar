import type { Metadata } from "next";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Envíos y entregas",
  description:
    "Plazos y costos de envío de Moto Plus Talar: El Talar, Gran Buenos Aires, CABA e interior del país.",
};

const PLAZOS = [
  {
    zona: "El Talar y zonas aledañas (General Pacheco, Ricardo Rojas, Las Tunas, Don Torcuato y alrededores)",
    plazo: "En el día, máximo 24 hs",
  },
  { zona: "Gran Buenos Aires y CABA", plazo: "Hasta 48 hs" },
  { zona: "Interior del país", plazo: "De 5 a 10 días hábiles" },
];

export default async function EnviosPage() {
  const config = await getConfiguracion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-base-muted md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Envíos y entregas</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-base-white">¿Cuándo llega mi pedido?</h2>
        <div className="overflow-hidden rounded-2xl border border-base-border">
          <table className="w-full text-left">
            <thead className="bg-base-dark text-base-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Zona</th>
                <th className="px-4 py-3 font-semibold">Plazo estimado</th>
              </tr>
            </thead>
            <tbody>
              {PLAZOS.map((p) => (
                <tr key={p.zona} className="border-t border-base-border/60">
                  <td className="px-4 py-3">{p.zona}</td>
                  <td className="px-4 py-3 font-semibold text-base-white">{p.plazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          Realizamos entregas en El Talar y localidades cercanas, para que recibas tus repuestos de
          manera rápida y cómoda. Los plazos son estimados y pueden variar según la disponibilidad del
          producto, la zona de entrega y la logística del envío.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-base-white">Costos y condiciones de envío</h2>
        <ul className="flex flex-col gap-3">
          <li>
            <span className="font-semibold text-base-white">El Talar y zonas aledañas: </span>
            envío sin cargo en compras superiores a $300.000.
          </li>
          <li>
            <span className="font-semibold text-base-white">CABA y Gran Buenos Aires: </span>
            en compras superiores a $300.000, 50 % de descuento en el costo del envío, sujeto a la
            evaluación del peso y las dimensiones del pedido.
          </li>
          <li>
            <span className="font-semibold text-base-white">Interior del país: </span>
            el costo se cotiza según el peso, las dimensiones y el destino. Podés elegir tu transporte
            de confianza o consultarnos las opciones disponibles.
          </li>
        </ul>
        <p className="mt-3">
          Para conocer el costo exacto y coordinar la entrega, contactanos por WhatsApp. Los
          beneficios de envío están sujetos a las condiciones detalladas para cada zona.
        </p>
      </section>

      {config.metodos_envio?.retiro_activo !== false && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-base-white">Retiro en el local</h2>
          <p>
            También podés retirar tu pedido en {config.direccion}, {config.ciudad}, y abonar en efectivo
            contra entrega en nuestro local.
          </p>
        </section>
      )}

      <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank">
        Consultar envío por WhatsApp
      </ButtonLink>
    </div>
  );
}
