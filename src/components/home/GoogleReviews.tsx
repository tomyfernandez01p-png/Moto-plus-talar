import type { Configuracion } from "@/lib/config";
import { IconStar } from "@/components/ui/Icons";

/**
 * Reseñas de Google. Sin GOOGLE_PLACES_API_KEY configurada, el bloque queda
 * claramente marcado como demo (nunca se inventan testimonios reales) y no
 * se renderiza en producción salvo que el admin lo active a sabiendas.
 *
 * Pedido del usuario: "que aparezcan las reseñas flotando y que aparezca un
 * botón de reseñar". El botón usa `config.google.review_url` -- el link
 * real de "pedir reseña" del perfil de Google Business del local, que el
 * admin carga en /admin/configuracion (nunca inventado). El "flotando" se
 * resuelve con tarjetas vacías de referencia (la forma del bloque, no
 * contenido inventado) usando la animación `float-y` -- hasta que haya
 * API key real, no hay texto de reseña que mostrar ahí dentro.
 */
export function GoogleReviews({ config }: { config: Configuracion }) {
  const activo = config.google?.reviews_enabled;
  const tieneApiKey = !!process.env.GOOGLE_PLACES_API_KEY;
  const reviewUrl = config.google?.review_url;

  if (!activo) return null;

  if (!tieneApiKey) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-base-border bg-base-surface/40 p-8">
          {/* tarjetas flotando de referencia visual: vacías a propósito, sin
              nombres ni citas inventadas -- adelantan la forma del bloque,
              no un testimonio falso. Antes solo se veían desde `sm:` --
              en mobile (donde se prueba el sitio en esta vuelta) el bloque
              quedaba igual que antes, sin ningún cambio visible. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-[4%] top-4 h-14 w-28 animate-float-y rounded-2xl border border-base-border bg-base-surface/80 opacity-70 sm:left-[6%] sm:top-5 sm:h-16 sm:w-36" />
            <div className="absolute right-[4%] top-9 h-14 w-28 animate-float-y rounded-2xl border border-base-border bg-base-surface/80 opacity-70 [animation-delay:1.3s] sm:right-[8%] sm:top-10 sm:h-16 sm:w-36" />
            <div className="absolute left-[32%] bottom-3 hidden h-16 w-36 animate-float-y rounded-2xl border border-base-border bg-base-surface/80 opacity-70 [animation-delay:0.7s] sm:block" />
          </div>

          <div className="relative flex flex-col items-center gap-2 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-base-surface text-base-muted">
              <IconStar className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-base-white">Reseñas de Google — próximamente</p>
            <p className="max-w-md text-xs text-base-muted">
              Este bloque va a mostrar reseñas reales del local en cuanto se conecte la integración
              con Google (configurá <code>GOOGLE_PLACES_API_KEY</code> y <code>GOOGLE_PLACE_ID</code>).
              No se muestran testimonios de ejemplo.
            </p>
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105"
              >
                <IconStar className="h-4 w-4" />
                Dejar una reseña
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Con la API key configurada, este bloque se completa con una llamada
  // server-side a la Places API (Place Details -> reviews) y cachea el
  // resultado; se deja el punto de integración listo, sin credenciales
  // inventadas.
  return null;
}
