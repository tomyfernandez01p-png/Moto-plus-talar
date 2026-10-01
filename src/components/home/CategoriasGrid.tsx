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

export function CategoriasGrid({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo="Categorías principales" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {categorias.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-base-border bg-base-surface px-3 pb-4 pt-6 text-center transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand-orange/50 hover:shadow-card-hover"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,106,0,0.18),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-brand-orange/20 bg-brand-orange/10 text-brand-orange transition-colors duration-200 group-hover:bg-brand-orange group-hover:text-white">
              {cat.imagen_url ? (
                <Image
                  src={cat.imagen_url}
                  alt={cat.nombre}
                  fill
                  unoptimized={isDataUrl(cat.imagen_url)}
                  className="object-cover"
                />
              ) : (
                <CategoryIcon slug={cat.slug} className="h-8 w-8" />
              )}
            </div>
            <span className="relative text-xs font-semibold leading-tight text-base-white group-hover:text-brand-orange">
              {cat.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
