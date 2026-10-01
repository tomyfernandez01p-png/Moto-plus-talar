import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeGenerico } from "@/lib/whatsapp";

export function Hero({ config }: { config: Configuracion }) {
  const hero = config.hero;
  if (!hero?.activo) return null;

  return (
    <section className="relative overflow-hidden bg-base-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,106,0,0.15),transparent_50%)]" />
      {/* elementos decorativos flotantes: puro CSS, no imágenes ni marcas */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-float-slow rounded-full bg-brand-orange/10 blur-3xl md:h-96 md:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 animate-float-slow rounded-full bg-brand-orange/5 blur-3xl [animation-delay:1.5s]"
      />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 md:px-6 md:py-24">
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
            <ButtonLink href={hero.boton_url || "/productos"} size="lg">
              {hero.boton_texto || "Ver productos"}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </ButtonLink>
          </div>
          {config.whatsapp_link && (
            <ButtonLink
              href={whatsappLink(config, mensajeGenerico())}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
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
