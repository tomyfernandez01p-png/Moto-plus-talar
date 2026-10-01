import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";

export const metadata: Metadata = { title: "Nosotros" };

export default async function NosotrosPage() {
  const config = await getConfiguracion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-4 text-2xl font-bold text-base-white">Nosotros</h1>
      <p className="text-base-muted">
        {config.nombre_negocio} es tu casa de repuestos y accesorios para motos en{" "}
        {config.ciudad}, {config.provincia}. {config.rubro}
      </p>
      <p className="mt-4 text-base-muted">
        Trabajamos con las principales marcas del mercado y te ayudamos a encontrar la pieza
        correcta para tu moto, ya sea que la compres online o vengas a nuestro local.
      </p>
    </div>
  );
}
