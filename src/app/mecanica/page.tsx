import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { MecanicaForm } from "./MecanicaForm";

export const metadata: Metadata = {
  title: "Turno de mecánica",
  description:
    "Pedí un turno para mecánica de moto: service, frenos, eléctrico y más. La dueña revisa cada pedido antes de confirmarlo.",
};

export default async function MecanicaPage() {
  const supabase = createClient();
  const [{ data: servicios }, config] = await Promise.all([
    supabase.from("servicios_mecanica").select("id, nombre, descripcion").eq("activo", true).order("orden"),
    getConfiguracion(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white">Turno de mecánica</h1>
      <p className="mb-6 text-sm text-base-muted">
        Contanos qué servicio necesita tu moto. Revisamos cada pedido a mano y te confirmamos el
        turno por WhatsApp o email — esto no agenda el turno automáticamente.
      </p>

      {servicios && servicios.length > 0 ? (
        <MecanicaForm servicios={servicios} config={config} />
      ) : (
        <div className="rounded-2xl border border-dashed border-base-border p-8 text-center text-sm text-base-muted">
          Por ahora no hay servicios de mecánica disponibles para pedir turno online. Escribinos por
          WhatsApp y coordinamos directamente.
        </div>
      )}
    </div>
  );
}
