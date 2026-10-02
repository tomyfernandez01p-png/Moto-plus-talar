import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeGenerico } from "@/lib/whatsapp";

/**
 * Hero (brief #6). El repo no tiene ninguna foto real (ni del local ni de
 * producto) en `public/` -- en vez de inventar una URL de imagen de stock,
 * el tratamiento visual se resuelve 100% con gradientes + un trazo SVG
 * original (silueta de rueda/velocidad, no una marca ni un logo de
 * terceros). El título/subtítulo siguen saliendo de `config.hero`, tal
 * como ya lo podía editar el admin -- ningún texto queda hardcodeado acá.
 */
export function Hero({ config }: { config: Configuracion }) {
  const hero = config.hero;
  if (!hero?.activo) return null;

  return (
    <section className="bg-grain relative overflow-hidden bg-base-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,106,0,0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.5)_100%)]" />

      {/* elementos decorativos flotantes: puro CSS, no imágenes ni marcas */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-float-slow rounded-full bg-brand-orange/10 blur-3xl md:h-96 md:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 animate-float-slow rounded-full bg-brand-orange/5 blur-3xl [animation-delay:1.5s]"
      />

      {/* silueta decorativa original: anillo + rayos de velocidad, sugiere
          una rueda de moto sin ser una foto ni un logo de nadie */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[420px] w-[420px] -translate-y-1/2 text-brand-orange/[0.07] md:block lg:-right-10"
      >
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="18" fill="none" />
        <circle cx="200" cy="200" r="92" stroke="currentColor" strokeWidth="10" fill="none" />
        <circle cx="200" cy="200" r="10" fill="currentColor" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angulo = (i * 360) / 12;
          return (
            <line
              key={i}
              x1="200"
              y1="200"
              x2="200"
              y2="58"
              stroke="currentColor"
              strokeWidth="6"
              transform={`rotate(${angulo} 200 200)`}
            />
          );
        })}
      </svg>

      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 md:px-6 md:py-28">
        <span className="animate-fade-in-up rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-orange">
          {config.nombre_negocio} — Tu moto, nuestro compromiso
        </span>
        <h1 className="max-w-2xl animate-fade-in-up text-4xl font-extrabold leading-tight tracking-tight text-base-white [animation-delay:100ms] md:text-6xl">
          {hero.titulo}
        </h1>
        {hero.subtitulo && (
          <p className="max-w-xl animate-fade-in-up text-lg text-base-muted [animation-delay:200ms]">
            {hero.subtitulo}
          </p>
        )}
        <div className="flex animate-fade-in-up flex-wrap gap-3 [animation-delay:300ms]">
          <div className="group">
            <ButtonLink href={hero.boton_url || "/productos"} size="lg" className="hover:shadow-glow">
              {hero.boton_texto || "Ver productos"}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </ButtonLink>
          </div>
          <ButtonLink href="/mi-moto" variant="secondary" size="lg">
            Buscar por mi moto
          </ButtonLink>
          {config.whatsapp_link && (
            <ButtonLink
              href={whatsappLink(config, mensajeGenerico())}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
            >
              Hablanos por WhatsApp
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
