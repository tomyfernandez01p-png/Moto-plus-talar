import { ProductCard } from "@/components/product/ProductCard";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function ProductGrid({ productos }: { productos: VistaProducto[] }) {
  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-base-border p-12 text-center text-sm text-base-muted">
        Actualmente no hay productos para esta búsqueda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {productos.map((p) => (
        <ProductCard key={p.id} producto={p} />
      ))}
    </div>
  );
}
