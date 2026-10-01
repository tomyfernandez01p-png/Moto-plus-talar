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
        <div className="rounded-2xl border border-dashed border-base-border p-6 text-center text-sm text-base-muted">
          [DEMO] Reseñas de Google: configurá <code>GOOGLE_PLACES_API_KEY</code> y{" "}
          <code>GOOGLE_PLACE_ID</code> para traer las reseñas reales del local.
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
