import Image from "next/image";
import { cn, isDataUrl, logoChipClass } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

interface Marca {
  nombre: string;
  slug: string;
  logo_url: string | null;
}

function ItemMarca({ marca, oculta }: { marca: Marca; oculta?: boolean }) {
  return (
    <li aria-hidden={oculta} className="mr-20 flex h-20 w-32 shrink-0 flex-col items-center justify-center gap-1.5 md:mr-28">
      {marca.logo_url ? (
        <>
          <div className={cn("relative h-10 w-full", logoChipClass(marca.logo_url))}>
            <Image src={marca.logo_url} alt="" fill unoptimized={isDataUrl(marca.logo_url)} className="object-contain" />
          </div>
          <span className="max-w-[124px] truncate text-[11px] font-semibold text-base-muted">{marca.nombre}</span>
        </>
      ) : (
        // Sin logo cargado todavía: solo el nombre de la marca (sin iniciales
        // inventadas ni círculos).
        <span className="max-w-[124px] truncate text-center text-sm font-extrabold uppercase tracking-wider text-base-white/80">
          {marca.nombre}
        </span>
      )}
    </li>
  );
}

/**
 * Tira informativa de las marcas más relevantes: pasa sola de forma continua,
 * con espacio entre marcas, y NO es interactiva (sin enlaces, sin pausa al
 * pasar el mouse o tocar). La lista va repetida y la animación recorre
 * exactamente la mitad, así el corte no se nota. Con "reducir movimiento"
 * activado queda quieta y centrada.
 */
export function MarcasCarousel({ marcas }: { marcas: Marca[] }) {
  if (marcas.length === 0) return null;
  const lista = [...marcas, ...marcas, ...marcas, ...marcas];

  return (
    <section aria-label="Marcas" className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo="Nuestras marcas" />
      <div className="fade-edge-x pointer-events-none select-none -mx-4 overflow-hidden px-4 md:-mx-6 md:px-6">
        <ul className="flex w-max animate-marquee-brands items-center py-1 motion-reduce:mx-auto motion-reduce:animate-none">
          {lista.map((m, i) => (
            <ItemMarca key={`${m.slug}-${i}`} marca={m} oculta={i >= marcas.length} />
          ))}
        </ul>
      </div>
    </section>
  );
}
