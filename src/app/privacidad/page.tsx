import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";

export const metadata: Metadata = { title: "Política de privacidad" };

export default async function PrivacidadPage() {
  const config = await getConfiguracion();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 text-sm text-base-muted">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Política de privacidad</h1>
      <p className="mb-4">
        Usamos tus datos (nombre, email, teléfono y dirección) exclusivamente para procesar tu
        pedido, coordinar la entrega y contactarte por consultas. No compartimos tu información
        con terceros salvo lo necesario para el envío o el procesamiento del pago.
      </p>
      <p className="mb-4">
        Usamos cookies esenciales para el funcionamiento del sitio y, si las aceptás, cookies de
        analítica para entender cómo se usa la tienda.
      </p>
      <p>
        Para ejercer tus derechos sobre tus datos personales, escribinos a {config.email}.
      </p>
    </div>
  );
}
