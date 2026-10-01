/**
 * Iconografía propia por categoría (SVG, no fotos de stock) para las
 * tarjetas de categorías. Es un recurso de UI genérico — no representa
 * productos ni stock real — así que no choca con "no inventar productos".
 * Si en el futuro se carga `imagen_url` para una categoría, esa imagen
 * tiene prioridad (ver CategoriasGrid.tsx) y este ícono queda como fallback.
 */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const iconos: Record<string, React.ReactNode> = {
  "aceites-y-lubricantes": (
    <path d="M12 2 7 9.5a6 6 0 1 0 10 0L12 2Z" />
  ),
  cubiertas: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4 6 18M18 18l-1.6-1.6M7.6 7.6 6 6" />
    </>
  ),
  "kits-de-transmision": (
    <>
      <circle cx="8" cy="16" r="3.2" />
      <circle cx="17" cy="8" r="3.2" />
      <path d="M10.3 13.7 14.7 10.3" />
    </>
  ),
  espejos: (
    <>
      <path d="M12 3c3.6 0 6 2.9 6 6.5S15.6 17 12 17s-6-3.4-6-7.5S8.4 3 12 3Z" />
      <path d="M12 17v4M9 21h6" />
    </>
  ),
  accesorios: (
    <>
      <path d="M14.7 6.3a3.5 3.5 0 0 0-4.9 4.9L4 17v3h3l5.8-5.8a3.5 3.5 0 0 0 4.9-4.9l-2.4 2.4-2-2 2.4-2.4Z" />
    </>
  ),
  baterias: (
    <>
      <rect x="3" y="8" width="16" height="10" rx="1.5" />
      <path d="M19 11h2v4h-2M7 11v4M11 11v4" />
    </>
  ),
  lamparas: (
    <>
      <circle cx="12" cy="10" r="5.2" />
      <path d="M9.5 20h5M10 15.5v3M14 15.5v3M8.5 5.5 7 4M15.5 5.5 17 4" />
    </>
  ),
};

const fallback = (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.6-2-3.4-2.4.8a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.3a7.6 7.6 0 0 0-2.6 1.5l-2.4-.8-2 3.4 2 1.6a7.8 7.8 0 0 0 0 3l-2 1.6 2 3.4 2.4-.8a7.6 7.6 0 0 0 2.6 1.5l.4 2.3h4l.4-2.3a7.6 7.6 0 0 0 2.6-1.5l2.4.8 2-3.4-2-1.6Z" />
  </>
);

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  return (
    <svg {...base} className={className}>
      {iconos[slug] ?? fallback}
    </svg>
  );
}
