import type { Metadata } from "next";
import { whatsappLink, mapsComoLlegarUrl } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Contacto" };

export default async function ContactoPage() {
  const config = await getConfiguracion();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Contacto</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-base-border bg-base-surface p-5">
          <h2 className="text-sm font-bold text-brand-orange">Dirección</h2>
          <p className="mt-1 text-sm text-base-white">
            {config.direccion}, {config.ciudad}, {config.provincia}
          </p>
          <ButtonLink href={mapsComoLlegarUrl(config)} target="_blank" size="sm" variant="outline" className="mt-3">
            Cómo llegar
          </ButtonLink>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-surface p-5">
          <h2 className="text-sm font-bold text-brand-orange">Horarios</h2>
          <p className="mt-1 text-sm text-base-white">Lun a Vie: {config.horarios?.lunes_viernes}</p>
          <p className="text-sm text-base-white">Sáb: {config.horarios?.sabado}</p>
          <p className="text-sm text-base-white">Dom: {config.horarios?.domingo}</p>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-surface p-5">
          <h2 className="text-sm font-bold text-brand-orange">WhatsApp</h2>
          <p className="mt-1 text-sm text-base-white">{config.whatsapp}</p>
          <ButtonLink href={whatsappLink(config, mensajeGenerico())} target="_blank" size="sm" className="mt-3">
            Escribinos
          </ButtonLink>
        </div>
        <div className="rounded-2xl border border-base-border bg-base-surface p-5">
          <h2 className="text-sm font-bold text-brand-orange">Email</h2>
          <p className="mt-1 text-sm text-base-white">{config.email}</p>
        </div>
      </div>
    </div>
  );
}
