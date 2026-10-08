import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

interface Marca {
  nombre: string;
  slug: string;
  logo_url: string | null;
}

function TarjetaMarca({ marca, oculta }: { marca: Marca; oculta?: boolean }) {
  return (
    <Link
      href={`/marca/${marca.slug}`}
      tabIndex={oculta ? -1 : 0}
      aria-hidden={oculta}
      // Pedido del usuario: solo logo + nombre, sin tarjeta/fondo alrededor
      // (antes tenía una tarjeta clara bg-neutral-100). El logo queda
      // apoyado directo sobre el fondo de la sección.
      className="group flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1.5 transition-transform duration-200 ease-smooth hover:-translate-y-0.5"
    >
      {marca.logo_url ? (
        <div className="relative h-10 w-full transition-transform duration-200 ease-smooth group-hover:scale-110">
          <Image
            src={marca.logo_url}
            alt=""
            fill
            unoptimized={isDataUrl(marca.logo_url)}
            className="object-contain"
          />
        </div>
      ) : (
        // Sin logo todavía (ninguna marca tiene `logo_url` cargado hoy):
        // un monograma con la inicial real de la marca en vez de un
        // nombre chiquito perdido en una caja vacía.
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-extrabold text-brand-orange transition-transform duration-200 ease-smooth group-hover:scale-110">
          {marca.nombre.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="max-w-[108px] truncate text-[11px] font-semibold text-base-muted transition-colors duration-200 group-hover:text-base-white">
        {marca.nombre}
      </span>
    </Link>
  );
}

/**
 * Pedido del usuario: "que aparezcan todas las marcas y que vayan
 * pasando" -- ya se traían TODAS las marcas activas (sin límite, ver
 * page.tsx), solo faltaba el movimiento. Tira infinita con la lista
 * duplicada una vez (truco estándar de marquee: al llegar a -50% se ve
 * idéntico al arranque, el corte no se nota). Usa `animate-marquee-slow`
 * (50s, la misma velocidad que las reseñas) en vez de la original de 28s
 * -- pedido explícito del usuario: "bajale la velocidad que sea legible".
 * Se pausa al pasar el mouse o tocar (no se pierde una marca por apuro) y
 * respeta "reducir movimiento" del sistema operativo.
 */
export function MarcasCarousel({ marcas }: { marcas: Marca[] }) {
  if (marcas.length === 0) return null;
  const marcasDuplicadas = [...marcas, ...marcas];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo="Todas nuestras marcas" verTodoHref="/marcas" />
      <div className="fade-edge-x group -mx-4 overflow-hidden px-4 md:-mx-6 md:px-6">
        <div className="flex w-max animate-marquee-slow gap-4 py-1 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {marcasDuplicadas.map((m, i) => (
            <TarjetaMarca key={`${m.slug}-${i}`} marca={m} oculta={i >= marcas.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
