import type { Temporada } from "@/lib/temporadas";

/** Franja fina con el saludo de la temporada. Es solo un saludo, no una oferta. */
export function TemporadaBanner({ temporada }: { temporada: Temporada }) {
  return (
    <div
      className="w-full px-4 py-1.5 text-center text-xs font-semibold text-white"
      style={{ backgroundColor: temporada.bannerFondo }}
    >
      <span aria-hidden>{temporada.emojis[0]}</span> {temporada.saludo}{" "}
      <span aria-hidden>{temporada.emojis[0]}</span>
    </div>
  );
}
