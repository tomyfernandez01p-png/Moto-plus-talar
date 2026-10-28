import Link from "next/link";

/**
 * Bloque de acceso a "Turno de mecánica" en la Home.
 * Toda la tarjeta es un solo link: título arriba y, abajo, una barra-botón
 * con el texto a la izquierda y una flecha larga a la derecha que se
 * desplaza en hover (mismo esquema de tarjeta-botón que se pidió como
 * referencia, con nuestros propios textos, colores y trazo de flecha).
 */
export function TurnosCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link
        href="/mecanica"
        className="group block overflow-hidden rounded-3xl border border-base-border bg-base-dark shadow-card transition-shadow duration-200 hover:border-brand-orange/60 hover:shadow-glow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-orange"
      >
        <div className="px-6 pb-6 pt-8 md:px-10 md:pt-10">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-base-white md:text-4xl">
            Turno de mecánica
          </h2>
          <p className="mt-2 text-base text-base-muted">
            Contanos qué necesita tu moto y coordinamos la atención.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 bg-brand-orange px-6 py-4 text-white transition-colors duration-200 group-hover:bg-brand-orange-dark md:px-10 md:py-5">
          <span className="text-base font-extrabold uppercase tracking-wide md:text-lg">
            Pedí tu turno
          </span>
          <svg
            aria-hidden
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 24"
            className="h-6 w-12 transition-transform duration-200 group-hover:translate-x-2 md:h-7 md:w-14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12h42" />
            <path d="M34 3l10 9-10 9" />
          </svg>
        </div>
      </Link>
    </section>
  );
}
