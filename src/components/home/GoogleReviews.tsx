import type { Configuracion } from "@/lib/config";

/**
 * Reseñas de Google. Sin GOOGLE_PLACES_API_KEY configurada, el bloque queda
 * claramente marcado como demo (nunca se inventan testimonios reales) y no
 * se renderiza en producción salvo que el admin lo active a sabiendas.
 */
export function GoogleReviews({ config }: { config: Configuracion }) {
  const activo = config.google?.reviews_enabled;
  const tieneApiKey = !!process.env.GOOGLE_PLACES_API_KEY;

  if (!activo) return null;

  if (!tieneApiKey) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-base-border bg-base-surface/40 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-base-surface text-base-muted">
            ★
          </span>
          <p className="text-sm font-medium text-base-white">Reseñas de Google — próximamente</p>
          <p className="max-w-md text-xs text-base-muted">
            Este bloque va a mostrar reseñas reales del local en cuanto se conecte la integración
            con Google (configurá <code>GOOGLE_PLACES_API_KEY</code> y <code>GOOGLE_PLACE_ID</code>).
            No se muestran testimonios de ejemplo.
          </p>
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
