import { ButtonLink } from "@/components/ui/Button";
import { IconWrench, IconArrowRight } from "@/components/ui/Icons";

/**
 * Bloque visual completo para el servicio de mecánica con turno (pedido del
 * usuario: que tenga "presencia REAL en la Home", no solo el botón
 * flotante). Mismo lenguaje visual que PromoBanner (grain + trama
 * diagonal + glow), pero con su propio ícono/copy para que se note que es
 * un servicio, no una categoría de producto.
 */
export function TurnosCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="bg-grain relative overflow-hidden rounded-3xl border border-brand-orange/25 bg-[linear-gradient(135deg,#17120c_0%,#151517_45%,#0a0a0b_100%)] px-6 py-12 md:px-14 md:py-16">
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
          className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 -translate-y-1/2 animate-glow-breathe rounded-full bg-brand-orange/20 blur-3xl"
        />

        <div className="relative flex flex-col items-start gap-5 md:max-w-xl">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
            <IconWrench className="h-7 w-7" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
              ¿Necesitás hacerle algo a tu moto?
            </p>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-base-white md:text-4xl">
              Mecánica con turno
            </h2>
            <p className="text-base text-base-muted">Reservá tu turno y coordinamos la atención.</p>
          </div>
          <div className="group">
            <ButtonLink href="/mecanica" size="lg" className="hover:shadow-glow">
              Pedí tu turno
              <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
