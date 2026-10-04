import type { Configuracion } from "@/lib/config";
import { IconStar } from "@/components/ui/Icons";
import { SectionHeader } from "./SectionHeader";

/**
 * Reseñas de Google. Sin GOOGLE_PLACES_API_KEY configurada, el bloque queda
 * claramente marcado como vista previa (nunca se inventa un testimonio
 * atribuido a un cliente real) y no se renderiza salvo que el admin lo
 * active a sabiendas.
 *
 * Pedido del usuario: tarjetas que se desplacen horizontalmente con
 * animación automática + botón "Dejá tu reseña". El texto de las tarjetas
 * de ejemplo describe el bloque, no simula una opinión real -- cada una
 * lleva una etiqueta "VISTA PREVIA" bien visible y ninguna tiene firma de
 * cliente. El botón usa `config.google.review_url`, el link real que el
 * admin carga en /admin/configuracion (nunca inventado).
 */
const EJEMPLOS_LAYOUT = [
  { estrellas: 5, texto: "Así se va a ver una reseña real de Google en esta tarjeta." },
  { estrellas: 5, texto: "Esta sección todavía no tiene reseñas conectadas -- es solo el diseño." },
  { estrellas: 4, texto: "Cuando se configure la integración, acá van a aparecer opiniones reales de clientes." },
  { estrellas: 5, texto: "Ninguna de estas tarjetas es una reseña real todavía." },
];

function TarjetaVistaPrevia({ estrellas, texto, oculta }: { estrellas: number; texto: string; oculta?: boolean }) {
  return (
    <div
      aria-hidden={oculta}
      className="relative flex h-40 w-72 shrink-0 flex-col justify-between gap-3 rounded-2xl border border-dashed border-base-border bg-base-surface/50 p-5"
    >
      <span className="absolute right-3 top-3 rounded-full bg-base-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-base-muted">
        Vista previa
      </span>
      <div className="flex gap-0.5 text-brand-orange">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconStar key={i} className={`h-4 w-4 ${i < estrellas ? "text-brand-orange" : "text-base-border"}`} />
        ))}
      </div>
      <p className="line-clamp-3 text-sm text-base-muted">{texto}</p>
    </div>
  );
}

export function GoogleReviews({ config }: { config: Configuracion }) {
  const activo = config.google?.reviews_enabled;
  const tieneApiKey = !!process.env.GOOGLE_PLACES_API_KEY;
  const reviewUrl = config.google?.review_url;

  if (!activo) return null;

  if (!tieneApiKey) {
    const tarjetas = [...EJEMPLOS_LAYOUT, ...EJEMPLOS_LAYOUT];
    return (
      <section className="mx-auto max-w-7xl py-10">
        <div className="px-4 md:px-6">
          <SectionHeader titulo="Lo que dicen nuestros clientes" />
          <p className="-mt-3 mb-1 max-w-md text-sm text-base-muted">
            Todavía no hay reseñas reales conectadas (falta configurar la integración con Google). Las
            tarjetas de abajo son solo un ejemplo del diseño, no opiniones reales.
          </p>
        </div>

        <div className="fade-edge-x group/reviews -mx-4 overflow-hidden px-4 py-4 md:-mx-6 md:px-6">
          <div className="flex w-max animate-marquee-slow gap-4 group-hover/reviews:[animation-play-state:paused] group-focus-within/reviews:[animation-play-state:paused] motion-reduce:animate-none">
            {tarjetas.map((r, i) => (
              <TarjetaVistaPrevia key={i} {...r} oculta={i >= EJEMPLOS_LAYOUT.length} />
            ))}
          </div>
        </div>

        {reviewUrl && (
          <div className="px-4 md:px-6">
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105"
            >
              <IconStar className="h-4 w-4" />
              Dejá tu reseña
            </a>
          </div>
        )}
      </section>
    );
  }

  // Con la API key configurada, este bloque se completa con una llamada
  // server-side a la Places API (Place Details -> reviews) y cachea el
  // resultado; se deja el punto de integración listo, sin credenciales
  // inventadas.
  return null;
}
