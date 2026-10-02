import { mapsComoLlegarUrl, type Configuracion } from "@/lib/config";
import { ButtonLink } from "@/components/ui/Button";
import { IconMapPin, IconClock } from "@/components/ui/Icons";

/**
 * Ubicación (brief #19): dirección y horarios reales, con un mapa embebido
 * por dirección (query de texto, sin ninguna coordenada inventada) usando
 * el embed público de Google Maps -- no hace falta API key, y el dominio
 * ya estaba permitido en el `frame-src` de next.config.mjs.
 */
export function StoreLocation({ config }: { config: Configuracion }) {
  if (!config.direccion) return null;

  const direccionCompleta = [config.direccion, config.ciudad, config.provincia, "Argentina"]
    .filter(Boolean)
    .join(", ");
  const mapaEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(direccionCompleta)}&output=embed`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid overflow-hidden rounded-3xl border border-base-border bg-base-surface md:grid-cols-2">
        <div className="relative order-2 min-h-[260px] bg-base-dark md:order-1">
          <iframe
            title={`Mapa — ${config.nombre_negocio}`}
            src={mapaEmbedUrl}
            className="absolute inset-0 h-full w-full grayscale-[40%] contrast-125"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="order-1 flex flex-col justify-center gap-4 p-6 md:order-2 md:p-10">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-orange">
            Nuestro local
          </span>
          <h2 className="text-2xl font-bold text-base-white">{config.nombre_negocio}</h2>

          <div className="flex items-start gap-3">
            <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-base-muted" />
            <div>
              <p className="text-sm text-base-white">{config.direccion}</p>
              <p className="text-sm text-base-muted">
                {config.ciudad}, {config.provincia}
              </p>
            </div>
          </div>

          {config.horarios && (
            <div className="flex items-start gap-3">
              <IconClock className="mt-0.5 h-5 w-5 shrink-0 text-base-muted" />
              <div className="text-sm text-base-muted">
                {config.horarios.lunes_viernes && <p>Lun a Vie: {config.horarios.lunes_viernes}</p>}
                {config.horarios.sabado && <p>Sáb: {config.horarios.sabado}</p>}
                {config.horarios.domingo && <p>Dom: {config.horarios.domingo}</p>}
              </div>
            </div>
          )}

          <ButtonLink href={mapsComoLlegarUrl(config)} target="_blank" rel="noopener noreferrer" className="mt-2 w-fit">
            Cómo llegar
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
