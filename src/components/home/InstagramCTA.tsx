import { whatsappLink, mapsComoLlegarUrl, type Configuracion } from "@/lib/config";
import { mensajeGenerico } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";

export function InfoLocalYRedes({ config }: { config: Configuracion }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-base-border bg-base-surface p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-orange">
            Nuestro local
          </h3>
          <p className="text-sm text-base-white">{config.direccion}</p>
          <p className="text-sm text-base-muted">
            {config.ciudad}, {config.provincia}
          </p>
          <p className="mt-2 text-sm text-base-muted">
            {config.horarios?.lunes_viernes && <>Lun a Vie: {config.horarios.lunes_viernes}<br /></>}
            {config.horarios?.sabado && <>Sáb: {config.horarios.sabado}<br /></>}
            {config.horarios?.domingo && <>Dom: {config.horarios.domingo}</>}
          </p>
          <ButtonLink href={mapsComoLlegarUrl(config)} target="_blank" variant="outline" size="sm" className="mt-4">
            Cómo llegar
          </ButtonLink>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-surface p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-orange">
            Hablanos por WhatsApp
          </h3>
          <p className="text-sm text-base-muted">
            Consultanos por stock, compatibilidad o turnos de mecánica.
          </p>
          <ButtonLink
            href={whatsappLink(config, mensajeGenerico())}
            target="_blank"
            size="sm"
            className="mt-4"
          >
            Escribinos ahora
          </ButtonLink>
        </div>

        <div className="rounded-2xl border border-base-border bg-base-surface p-6">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-orange">
            Seguinos en redes
          </h3>
          <p className="text-sm text-base-muted">
            Novedades, ingresos de stock y tips para tu moto.
          </p>
          <div className="mt-4 flex gap-2">
            {config.instagram_url && (
              <ButtonLink href={config.instagram_url} target="_blank" variant="secondary" size="sm">
                Instagram
              </ButtonLink>
            )}
            {config.facebook_url && (
              <ButtonLink href={config.facebook_url} target="_blank" variant="secondary" size="sm">
                Facebook
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
