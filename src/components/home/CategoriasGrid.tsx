import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { CategoryIcon } from "./CategoryIcon";
import { IconArrowRight } from "@/components/ui/Icons";

interface Categoria {
  nombre: string;
  slug: string;
  imagen_url: string | null;
  /** Conteo real (query propia), opcional: nunca se inventa un número. */
  cantidadProductos?: number;
}

export function CategoriasGrid({
  categorias,
  titulo = "Categorías principales",
}: {
  categorias: Categoria[];
  titulo?: string;
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {titulo && <SectionHeader titulo={titulo} />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {categorias.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group relative flex animate-fade-in-up flex-col items-center gap-2.5 overflow-hidden rounded-2xl border border-base-border bg-base-surface px-3 pb-4 pt-6 text-center transition-all duration-200 ease-smooth hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-card-hover"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,106,0,0.18),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-brand-orange/20 bg-brand-orange/10 text-brand-orange transition-all duration-300 ease-smooth group-hover:scale-105 group-hover:bg-brand-orange group-hover:text-white group-hover:shadow-glow-sm">
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
            {typeof cat.cantidadProductos === "number" && cat.cantidadProductos > 0 && (
              <span className="relative text-[11px] text-base-muted">
                +{cat.cantidadProductos} productos
              </span>
            )}
            <IconArrowRight className="relative h-3.5 w-3.5 text-base-muted opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-orange group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
