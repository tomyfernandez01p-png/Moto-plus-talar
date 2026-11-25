import Link from "next/link";

const ENGRANAJE = "M19.6 -3.9 L24.8 -2.7 L24.8 2.7 L19.6 3.9 L18.2 8.4 L21.7 12.4 L18.5 16.8 L13.6 14.7 L9.8 17.4 L10.3 22.8 L5.1 24.5 L2.4 19.9 L-2.4 19.9 L-5.1 24.5 L-10.3 22.8 L-9.8 17.4 L-13.6 14.7 L-18.5 16.8 L-21.7 12.4 L-18.2 8.4 L-19.6 3.9 L-24.8 2.7 L-24.8 -2.7 L-19.6 -3.9 L-18.2 -8.4 L-21.7 -12.4 L-18.5 -16.8 L-13.6 -14.7 L-9.8 -17.4 L-10.3 -22.8 L-5.1 -24.5 L-2.4 -19.9 L2.4 -19.9 L5.1 -24.5 L10.3 -22.8 L9.8 -17.4 L13.6 -14.7 L18.5 -16.8 L21.7 -12.4 L18.2 -8.4Z";

/**
 * Botón de "Solicitar turno" del inicio (lleva a /mecanica, el formulario de
 * turnos que ya existe). Diseño racing: forma angular con esquinas cortadas,
 * borde naranja, fondo propio (carbono + franjas + panal, ver .turno-fondo en
 * globals.css), engranaje metálico con herramientas cruzadas y flecha doble en
 * círculo naranja. Solo se mueve un poco al pasar el mouse / tocar; no hay
 * animaciones constantes.
 */
export function TurnosCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link
        href="/mecanica"
        aria-label="Solicitar turno de mecánica en Moto Plus Talar"
        className="group turno-clip mx-auto block w-full max-w-2xl bg-gradient-to-br from-brand-orange-light via-brand-orange to-brand-orange-dark p-[2px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),0_0_30px_-12px_rgb(var(--color-brand)/0.6)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(0,0,0,0.85),0_0_38px_-8px_rgb(var(--color-brand)/0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="turno-clip-in turno-fondo relative flex items-center gap-3 py-3 pl-3 pr-3 md:gap-5 md:py-4 md:pl-5 md:pr-5">
          <svg
            aria-hidden
            viewBox="-28 -28 56 56"
            className="h-16 w-16 shrink-0 drop-shadow-[0_3px_4px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-smooth group-hover:rotate-[30deg] md:h-20 md:w-20"
          >
            <defs>
              <radialGradient id="turno-metal" cx="35%" cy="30%" r="80%">
                <stop offset="0" stopColor="#f4f4f5" />
                <stop offset="0.45" stopColor="#a1a1aa" />
                <stop offset="1" stopColor="#3f3f46" />
              </radialGradient>
              <radialGradient id="turno-hub" cx="50%" cy="50%" r="60%">
                <stop offset="0" stopColor="#26262b" />
                <stop offset="1" stopColor="#0d0d10" />
              </radialGradient>
            </defs>
            <path d={ENGRANAJE} fill="url(#turno-metal)" stroke="#18181b" strokeWidth="0.8" strokeLinejoin="round" />
            <circle r="15.5" fill="url(#turno-hub)" stroke="#d4d4d8" strokeOpacity="0.55" strokeWidth="0.8" />
          </svg>
          {/* herramientas cruzadas: no giran con el engranaje */}
          <svg
            aria-hidden
            viewBox="-28 -28 56 56"
            className="pointer-events-none absolute left-3 h-16 w-16 md:left-5 md:h-20 md:w-20"
          >
            <g transform="rotate(-45)">
              <rect x="-1.4" y="-12" width="2.8" height="17" rx="0.8" fill="#e4e4e7" />
              <rect x="-3.2" y="4" width="6.4" height="9" rx="2" fill="rgb(255,106,0)" />
            </g>
            <g transform="rotate(45)">
              <rect x="-1.8" y="-6" width="3.6" height="19" rx="1.2" fill="#d4d4d8" />
              <circle cy="-9" r="4.8" fill="#f4f4f5" />
              <rect x="-1.7" y="-14" width="3.4" height="6.5" fill="#0d0d10" />
            </g>
          </svg>
          <span className="min-w-0 flex-1 leading-none">
            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange-light md:text-xs">
              Moto Plus Talar
            </span>
            <span className="mt-1.5 block text-2xl font-extrabold italic tracking-tight text-white md:text-4xl">
              Solicitar turno
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_0_16px_-2px_rgb(var(--color-brand)/0.8)] ring-1 ring-white/20 transition-transform duration-300 ease-smooth group-hover:translate-x-1 md:h-14 md:w-14">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l6 6-6 6" />
              <path d="M12.5 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </Link>
    </section>
  );
}
