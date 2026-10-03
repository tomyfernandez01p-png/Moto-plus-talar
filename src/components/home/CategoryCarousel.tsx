import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";

interface Categoria {
  nombre: string;
  slug: string;
  imagen_url: string | null;
}

/**
 * Carrusel horizontal de categorías destacadas (brief #10): mismas
 * categorías reales que la grilla de abajo, pero en una tira deslizable
 * -- variedad de ritmo visual (brief #28: "evitar sección gigante tras
 * sección gigante") sin inventar ninguna categoría nueva.
 */
export function CategoryCarousel({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader titulo="Categorías destacadas" />
      </div>
      <div className="fade-edge-x no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 [scroll-snap-type:x_mandatory] md:px-6">
        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className="group relative flex h-28 w-40 shrink-0 items-end overflow-hidden rounded-2xl border border-base-border bg-base-surface p-3 transition-all duration-200 ease-smooth [scroll-snap-align:start] hover:border-brand-orange/50 hover:shadow-card-hover"
          >
            {cat.imagen_url ? (
              <Image
                src={cat.imagen_url}
                alt=""
                fill
                unoptimized={isDataUrl(cat.imagen_url)}
                className="object-cover opacity-50 transition-transform duration-300 ease-smooth group-hover:scale-110 group-hover:opacity-60"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_32%,rgba(255,106,0,0.2),transparent_65%)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-orange/25 bg-brand-orange/10 text-brand-orange/90">
                  <CategoryIcon slug={cat.slug} className="h-6 w-6" />
                </span>
              </div>
            )}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-black/90 via-base-black/20 to-transparent" />
            <span className="relative text-sm font-bold text-base-white group-hover:text-brand-orange">
              {cat.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
