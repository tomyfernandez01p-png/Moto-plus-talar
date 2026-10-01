import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";

export const metadata: Metadata = { title: "Preguntas frecuentes" };

export default async function FaqPage() {
  const config = await getConfiguracion();

  const preguntas = [
    {
      q: "¿Hacen envíos a todo el país?",
      a: config.metodos_envio?.envio_activo
        ? "Sí, hacemos envíos. El costo se calcula según tu ubicación al finalizar la compra o se coordina por WhatsApp."
        : "Por ahora solo trabajamos con retiro en el local.",
    },
    {
      q: "¿Puedo retirar en el local?",
      a: config.metodos_envio?.retiro_activo
        ? `Sí, podés retirar en ${config.direccion}, ${config.ciudad} en nuestro horario de atención.`
        : "El retiro en el local no está disponible por el momento.",
    },
    {
      q: "¿Qué medios de pago aceptan?",
      a: [
        config.metodos_pago?.mercadopago && "Mercado Pago",
        config.metodos_pago?.transferencia && "Transferencia bancaria (Banco Nación o Banco Provincia)",
        config.metodos_pago?.efectivo && "Efectivo",
      ]
        .filter(Boolean)
        .join(", ") || "Consultanos por WhatsApp los medios de pago disponibles.",
    },
    {
      q: "No sé si el repuesto sirve para mi moto, ¿cómo lo confirmo?",
      a: "Usá el buscador '¿Qué moto tenés?' en la tienda, o escribinos por WhatsApp con el código del producto y el modelo de tu moto.",
    },
    {
      q: "¿Hacen mecánica con turno?",
      a: "Sí, coordinamos turnos de mecánica por WhatsApp.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Preguntas frecuentes</h1>
      <div className="flex flex-col divide-y divide-base-border rounded-2xl border border-base-border bg-base-surface">
        {preguntas.map((p) => (
          <details key={p.q} className="group p-5">
            <summary className="cursor-pointer list-none text-sm font-semibold text-base-white marker:content-none">
              {p.q}
            </summary>
            <p className="mt-2 text-sm text-base-muted">{p.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
