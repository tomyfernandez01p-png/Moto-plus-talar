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

function GoogleG({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.900-5.800l-7.6-5.900c-2.100 1.400-4.900 2.300-8.300 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.9 6.1C6.500 42.6 14.600 48 24 48z" />
    </svg>
  );
}

function TarjetaResena({
  nombre,
  estrellas,
  texto,
  detalle,
  oculta,
}: {
  nombre: string;
  estrellas: number;
  texto: string;
  detalle?: string;
  oculta?: boolean;
}) {
  return (
    <figure
      aria-hidden={oculta}
      className="flex w-[19rem] shrink-0 flex-col justify-between gap-5 rounded-3xl border border-base-border bg-base-dark p-6 sm:w-[22rem]"
    >
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-base-muted">
          <GoogleG className="h-4 w-4" />
          Reseña de Google
        </div>
        <div className="mt-3 flex gap-1" aria-label={`${estrellas} de 5 estrellas`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <IconStar key={i} className={`h-4 w-4 ${i < estrellas ? "text-yellow-400" : "text-base-border"}`} />
          ))}
        </div>
        <blockquote className="mt-4 text-sm italic leading-relaxed text-base-muted">&ldquo;{texto}&rdquo;</blockquote>
      </div>
      <figcaption className="flex items-center gap-3 border-t border-base-border pt-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-surface text-sm font-extrabold text-brand-orange">
          {nombre.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-base-white">{nombre}</span>
          {detalle && <span className="block truncate text-xs text-base-muted">{detalle}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function GoogleReviews({ config }: { config: Configuracion }) {
  const activo = config.google?.reviews_enabled;
  const tieneApiKey = !!process.env.GOOGLE_PLACES_API_KEY;
  const reviewUrl = config.google?.review_url;

  if (!activo) return null;

  const resenas = (config.google?.resenas ?? []).filter((r) => r.nombre && r.texto);
  if (resenas.length > 0) {
    // Se repite el grupo hasta llenar el ancho y se duplica para que el loop del banner no tenga saltos.
    const base = Array.from({ length: Math.max(1, Math.ceil(8 / resenas.length)) }, () => resenas).flat();
    const lista = [...base, ...base];
    return (
      <section className="mx-auto max-w-7xl py-10">
        <div className="px-4 md:px-6">
          <SectionHeader titulo="Lo que dicen nuestros clientes" />
        </div>
        <div className="fade-edge-x -mx-4 overflow-hidden px-4 py-4 md:-mx-6 md:px-6">
          <div className="flex w-max animate-marquee-slow gap-4">
            {lista.map((r, i) => (
              <TarjetaResena key={i} {...r} oculta={i >= base.length} />
            ))}
          </div>
        </div>
        {reviewUrl && (
          <div className="px-4 md:px-6">
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/70 bg-base-black px-6 py-3 text-sm font-semibold text-base-white shadow-glow-sm transition-all duration-200 hover:scale-105 hover:border-brand-orange hover:bg-base-dark hover:shadow-glow active:scale-95 active:shadow-none"
            >
              <IconStar className="h-4 w-4" />
              Dejá tu reseña
            </a>
          </div>
        )}
      </section>
    );
  }

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

        <div className="fade-edge-x -mx-4 overflow-hidden px-4 py-4 md:-mx-6 md:px-6">
          <div className="flex w-max animate-marquee-slow gap-4">
            {tarjetas.map((r, i) => (
              <TarjetaVistaPrevia key={i} {...r} oculta={i >= EJEMPLOS_LAYOUT.length} />
            ))}
          </div>
        </div>

        {reviewUrl && (
          <div className="flex flex-wrap gap-3 px-4 md:px-6">
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/70 bg-base-black px-6 py-3 text-sm font-semibold text-base-white shadow-glow-sm transition-all duration-200 hover:scale-105 hover:border-brand-orange hover:bg-base-dark hover:shadow-glow active:scale-95 active:shadow-none"
              >
                <IconStar className="h-4 w-4" />
                Dejá tu reseña
              </a>
            )}
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
