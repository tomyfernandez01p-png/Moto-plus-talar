import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icons";

/**
 * Banner publicitario grande entre secciones (brief: "debe sentirse como
 * una pieza publicitaria dentro del ecommerce", no un bloque de texto
 * sobre fondo negro). Genérico y reutilizable -- quien lo usa decide el
 * texto y el link real (nunca una categoría/producto inventado: ver
 * `page.tsx`, que arma el href a partir de las categorías reales o cae a
 * /productos si no existe la categoría buscada).
 */
export function PromoBanner({
  titulo,
  subtitulo,
  ctaTexto,
  ctaHref,
}: {
  titulo: string;
  subtitulo: string;
  ctaTexto: string;
  ctaHref: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="bg-grain relative overflow-hidden rounded-3xl border border-base-border bg-[linear-gradient(135deg,#17120c_0%,#151517_45%,#0a0a0b_100%)] px-6 py-12 md:px-14 md:py-16">
        {/* textura mecánica sutil: trama de líneas diagonales, muy baja
            opacidad -- decorativa, no compite con el texto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,106,0,0.6) 0px, rgba(255,106,0,0.6) 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 animate-glow-breathe rounded-full bg-brand-orange/20 blur-3xl"
        />

        <div className="relative flex flex-col items-start gap-5 md:max-w-xl">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-base-white md:text-4xl">
            {titulo}
          </h2>
          <p className="text-base text-base-muted">{subtitulo}</p>
          <div className="group">
            <ButtonLink href={ctaHref} size="lg" className="hover:shadow-glow">
              {ctaTexto}
              <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
