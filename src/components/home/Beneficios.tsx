const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

interface ItemBeneficio {
  texto: string;
  icono: React.ReactNode;
}

const items: ItemBeneficio[] = [
  {
    texto: "Mecánica con turno",
    icono: (
      <path d="M14.7 6.3a3.5 3.5 0 0 0-4.9 4.9L4 17v3h3l5.8-5.8a3.5 3.5 0 0 0 4.9-4.9l-2.4 2.4-2-2 2.4-2.4Z" />
    ),
  },
  {
    texto: "Envíos a todo el país",
    icono: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7.5" cy="18" r="1.6" />
        <circle cx="17.5" cy="18" r="1.6" />
      </>
    ),
  },
  {
    texto: "Retiro en el local",
    icono: (
      <>
        <path d="M4 10 12 4l8 6" />
        <path d="M5 9.5V20h14V9.5" />
        <path d="M9.5 20v-6h5v6" />
      </>
    ),
  },
  {
    texto: "Pago online y seguro",
    icono: (
      <>
        <path d="M12 3 5 6v5c0 4.2 3 7.4 7 9 4-1.6 7-4.8 7-9V6l-7-3Z" />
        <path d="m9.3 12 1.9 1.9 3.5-3.6" />
      </>
    ),
  },
  {
    texto: "Atención personalizada",
    icono: (
      <>
        <path d="M4 18v-1.5A3.5 3.5 0 0 1 7.5 13h2A3.5 3.5 0 0 1 13 16.5V18" />
        <circle cx="8.5" cy="7.5" r="3" />
        <path d="M15 13.3a3.3 3.3 0 1 0 0-6.6" />
        <path d="M17 13.3c1.8.5 3 1.8 3 3.4V18" />
      </>
    ),
  },
];

/**
 * Banner informativo (no son botones): franja sin bordes ni tarjetas, con los
 * datos del negocio pasando en una tira continua (la lista va duplicada y la
 * animación recorre exactamente la mitad, así el corte no se nota). No es interactiva (no se pausa ni reacciona al mouse/toque) y respeta "reducir movimiento" (queda quieta y centrada).
 */
export function Beneficios() {
  const lista = [...items, ...items, ...items, ...items];
  return (
    <section aria-label="Información de la tienda" className="relative z-10 py-10 md:py-14">
      <div className="fade-edge-x pointer-events-none select-none overflow-hidden">
        <ul className="flex w-max animate-marquee-slow items-center motion-reduce:mx-auto motion-reduce:animate-none">
          {lista.map((item, i) => (
            <li
              key={`${item.texto}-${i}`}
              aria-hidden={i >= items.length}
              className="mr-20 flex shrink-0 items-center gap-3 md:mr-28"
            >
              <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center text-brand-orange">
                <svg {...svgProps} className="h-6 w-6">
                  {item.icono}
                </svg>
              </span>
              <span className="whitespace-nowrap text-sm font-semibold text-base-white">{item.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
