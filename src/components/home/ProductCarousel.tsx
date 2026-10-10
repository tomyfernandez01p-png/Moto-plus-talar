import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeader } from "./SectionHeader";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function ProductCarousel({
  titulo,
  productos,
  verTodoHref,
}: {
  titulo: string;
  productos: VistaProducto[];
  verTodoHref?: string;
}) {
  if (productos.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo={titulo} verTodoHref={verTodoHref} />
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-5 xl:grid-cols-6">
        {productos.map((p) => (
          <div key={p.id} className="w-[45vw] shrink-0 snap-start sm:w-52 md:w-auto">
            <ProductCard producto={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
