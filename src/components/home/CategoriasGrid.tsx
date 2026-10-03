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

/**
 * Bajada corta por categoría -- es copy de interfaz (como "Envíos a todo
 * el país" en Beneficios), no un dato de negocio: nunca precios, stock ni
 * cantidades inventadas. Si una categoría no está en el mapa (una nueva
 * que se cargue después), la tarjeta simplemente no muestra bajada.
 */
const BAJADAS: Record<string, string> = {
  "aceites-y-lubricantes": "Lubricación y protección del motor",
  cubiertas: "Agarre y seguridad para cada terreno",
  "kits-de-transmision": "Cadena, piñón y corona a juego",
  espejos: "Visibilidad y repuesto para tu modelo",
  accesorios: "Para equipar y personalizar tu moto",
  baterias: "Arranque confiable, cero sorpresas",
  lamparas: "Iluminación clara para andar seguro",
};

export function CategoriasGrid({
  categorias,
  titulo = "Encontrá lo que buscás",
  subtitulo,
}: {
  categorias: Categoria[];
  titulo?: string;
  subtitulo?: string;
}) {
  if (categorias.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {titulo && (
        <div className="mb-5">
          <SectionHeader titulo={titulo} />
          {subtitulo && <p className="-mt-4 text-sm text-base-muted">{subtitulo}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {categorias.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            style={{ animationDelay: `${i * 50}ms` }}
            className="group relative flex aspect-[4/5] animate-fade-in-up flex-col justify-end overflow-hidden rounded-2xl border border-base-border bg-base-surface transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-card-hover"
          >
            {cat.imagen_url ? (
              <Image
                src={cat.imagen_url}
                alt=""
                fill
                unoptimized={isDataUrl(cat.imagen_url)}
                className="object-cover opacity-60 transition-transform duration-500 ease-smooth group-hover:scale-110 group-hover:opacity-70"
              />
            ) : (
              <>
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,106,0,0.16),transparent_60%)] transition-transform duration-500 ease-smooth group-hover:scale-110"
                />
                <CategoryIcon
                  slug={cat.slug}
                  className="pointer-events-none absolute right-3 top-3 h-14 w-14 text-brand-orange/20 transition-transform duration-500 ease-smooth group-hover:scale-110"
                />
              </>
            )}

            {/* overlay oscuro: deja el texto legible sobre imagen o icono */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base-black via-base-black/50 to-transparent"
            />

            <div className="relative flex flex-col gap-1 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-orange/30 bg-brand-orange/15 text-brand-orange">
                <CategoryIcon slug={cat.slug} className="h-5 w-5" />
              </span>
              <span className="mt-1.5 text-sm font-bold leading-tight text-base-white sm:text-base">
                {cat.nombre}
              </span>
              {BAJADAS[cat.slug] && (
                <span className="line-clamp-1 text-xs text-base-muted">{BAJADAS[cat.slug]}</span>
              )}
              <div className="mt-1 flex items-center justify-between">
                {typeof cat.cantidadProductos === "number" && cat.cantidadProductos > 0 ? (
                  <span className="text-[11px] font-medium text-base-muted">
                    +{cat.cantidadProductos} productos
                  </span>
                ) : (
                  <span />
                )}
                <IconArrowRight className="h-4 w-4 shrink-0 text-brand-orange transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
