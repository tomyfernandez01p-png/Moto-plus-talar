import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";

export const metadata: Metadata = { title: "Envíos" };

export default async function EnviosPage() {
  const config = await getConfiguracion();
  const envio = config.metodos_envio;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 text-sm text-base-muted">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Envíos</h1>
      {envio?.envio_activo ? (
        <p className="mb-4">
          Hacemos envíos a todo el país. El costo se calcula según tu ubicación
          {envio.costo_envio_fijo != null ? " y se muestra al finalizar la compra." : " y se coordina por WhatsApp una vez generado el pedido."}
        </p>
      ) : (
        <p className="mb-4">Por el momento no realizamos envíos; solo retiro en el local.</p>
      )}
      {envio?.retiro_activo && (
        <p>
          También podés retirar tu pedido sin cargo en {config.direccion}, {config.ciudad}, en
          nuestro horario de atención.
        </p>
      )}
    </div>
  );
}
