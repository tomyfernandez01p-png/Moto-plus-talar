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
      // fondo claro a propósito: los logos de marca vienen en su color
      // real (no todos quedan bien recortados en negro), así que una
      // tarjeta clara los muestra tal cual son en vez de aplicarles un
      // filtro gris que los deslava.
      className="group flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-transparent bg-neutral-100 p-3 shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-card-hover"
    >
      {marca.logo_url ? (
        <div className="relative h-full w-full transition-transform duration-200 ease-smooth group-hover:scale-110">
          <Image
            src={marca.logo_url}
            alt={marca.nombre}
            fill
            unoptimized={isDataUrl(marca.logo_url)}
            className="object-contain"
          />
        </div>
      ) : (
        // Sin logo todavía (ninguna marca tiene `logo_url` cargado hoy):
        // un monograma con la inicial real de la marca en vez de un
        // nombre chiquito perdido en una caja vacía.
        <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-200 ease-smooth group-hover:scale-105">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange/15 text-sm font-extrabold text-brand-orange">
            {marca.nombre.slice(0, 2).toUpperCase()}
          </span>
          <span className="max-w-[88px] truncate text-[11px] font-semibold text-neutral-700">
            {marca.nombre}
          </span>
        </div>
      )}
    </Link>
  );
}

/**
 * Pedido del usuario: "que aparezcan todas las marcas y que vayan
 * pasando" -- ya se traían TODAS las marcas activas (sin límite, ver
 * page.tsx), solo faltaba el movimiento. Tira infinita con la lista
 * duplicada una vez (truco estándar de marquee: al llegar a -50% se ve
 * idéntico al arranque, el corte no se nota) animada con la utilidad
 * `animate-marquee` de tailwind.config.ts. Se pausa al pasar el mouse o
 * tocar (no se pierde una marca por apuro) y respeta "reducir movimiento"
 * del sistema operativo.
 */
export function MarcasCarousel({ marcas }: { marcas: Marca[] }) {
  if (marcas.length === 0) return null;
  const marcasDuplicadas = [...marcas, ...marcas];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo="Todas nuestras marcas" verTodoHref="/marcas" />
      <div className="fade-edge-x group -mx-4 overflow-hidden px-4 md:-mx-6 md:px-6">
        <div className="flex w-max animate-marquee gap-4 py-1 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {marcasDuplicadas.map((m, i) => (
            <TarjetaMarca key={`${m.slug}-${i}`} marca={m} oculta={i >= marcas.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
