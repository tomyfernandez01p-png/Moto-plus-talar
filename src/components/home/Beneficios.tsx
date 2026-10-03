const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const items = [
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

export function Beneficios() {
  return (
    <section className="relative z-10 bg-base-black">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-10 sm:grid-cols-3 md:grid-cols-5 md:px-6">
        {items.map((item, i) => (
          <div
            key={item.texto}
            className="group flex animate-fade-in-up flex-col items-center gap-3 rounded-2xl border border-base-border bg-base-surface p-5 text-center transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-card-hover"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange transition-all duration-300 ease-smooth group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-glow-sm">
              <svg {...svgProps} className="h-6 w-6">
                {item.icono}
              </svg>
            </span>
            <span className="text-xs font-semibold leading-snug text-base-white sm:text-sm">
              {item.texto}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
