import type { Temporada } from "@/lib/temporadas";

/**
 * Decoración suave: pocos emojis que caen o flotan por los costados.
 * Solo CSS, sin JavaScript. No tapa clics (pointer-events: none), está oculto
 * para lectores de pantalla y se apaga si el usuario pidió menos movimiento.
 */
const POSICIONES = [8, 28, 50, 72, 92];

export function TemporadaEfecto({ temporada }: { temporada: Temporada }) {
  return (
    <div aria-hidden className="temporada-efecto pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {POSICIONES.map((left, i) => (
        <span
          key={i}
          className={temporada.efecto === "caer" ? "temporada-cae" : "temporada-flota"}
          style={{
            left: `${left}%`,
            animationDelay: `${(i * 1.7) % 9}s`,
            animationDuration: `${temporada.efecto === "caer" ? 11 + (i % 4) * 3 : 7 + (i % 3) * 2}s`,
            top: temporada.efecto === "caer" ? undefined : `${20 + ((i * 11) % 60)}%`,
          }}
        >
          {temporada.emojis[i % temporada.emojis.length]}
        </span>
      ))}
    </div>
  );
}
