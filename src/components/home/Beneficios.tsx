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
 * Banner informativo (no son botones): una sola franja con los datos del
 * negocio, sin tarjetas, sin enlaces y sin efectos al pasar el mouse.
 */
export function Beneficios() {
  return (
    <section aria-label="Información de la tienda" className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl border border-base-border bg-base-dark/70 px-5 py-5 sm:grid-cols-3 md:flex md:items-center md:justify-between md:gap-4 md:py-4">
        {items.map((item) => (
          <li key={item.texto} className="flex items-center gap-3">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center text-brand-orange">
              <svg {...svgProps} className="h-6 w-6">
                {item.icono}
              </svg>
            </span>
            <span className="text-xs font-semibold leading-snug text-base-white sm:text-sm">{item.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
