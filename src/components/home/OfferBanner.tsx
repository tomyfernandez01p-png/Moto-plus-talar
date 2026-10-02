import { ButtonLink } from "@/components/ui/Button";
import { IconTag, IconArrowRight } from "@/components/ui/Icons";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

/**
 * Banner de ofertas (brief #11). El porcentaje se calcula de los productos
 * reales en oferta (precio_anterior vs precio_vigente) -- nunca un
 * "HASTA 15% OFF" fijo inventado. Si no hay ofertas reales, el componente
 * no se renderiza.
 */
export function OfferBanner({ productos }: { productos: VistaProducto[] }) {
  const descuentos = productos
    .filter((p) => p.precio_anterior && p.precio_anterior > p.precio_vigente)
    .map((p) => Math.round((1 - p.precio_vigente / p.precio_anterior!) * 100));

  if (descuentos.length === 0) return null;
  const maximo = Math.max(...descuentos);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
      <div className="bg-grain relative overflow-hidden rounded-3xl border border-brand-orange/30 bg-gradient-to-br from-brand-orange/15 via-base-dark to-base-dark p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 animate-glow-breathe rounded-full bg-brand-orange/25 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-glow-sm">
              <IconTag className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold leading-none text-base-white md:text-3xl">
                HASTA {maximo}% OFF
              </h2>
              <p className="mt-1 text-sm text-base-muted">Productos seleccionados, por tiempo limitado.</p>
            </div>
          </div>
          <ButtonLink href="/productos?oferta=1" size="lg" className="w-full md:w-auto">
            Ver ofertas
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
