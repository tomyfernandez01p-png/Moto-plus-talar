import Link from "next/link";
import { cn } from "@/lib/utils";

export interface VarianteOpcion {
  id: string;
  slug: string;
  variante_etiqueta: string | null;
  estado_stock: string;
}

/** Elige el color/diseño de un producto: cada opción lleva a la ficha de esa variante. */
export function SelectorVariante({
  tipo,
  actualId,
  actualEtiqueta,
  variantes,
}: {
  tipo: string;
  actualId: string;
  actualEtiqueta: string | null;
  variantes: VarianteOpcion[];
}) {
  if (variantes.length < 2) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-base-muted">
        {tipo}: <span className="font-semibold text-base-white">{actualEtiqueta}</span>
      </p>
      <div role="list" className="flex flex-wrap gap-2">
        {variantes.map((v) => {
          const activa = v.id === actualId;
          const sinStock = v.estado_stock === "sin_stock";
          return (
            <Link
              key={v.id}
              role="listitem"
              href={`/producto/${v.slug}`}
              scroll={false}
              aria-current={activa ? "true" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                activa
                  ? "border-brand-orange bg-brand-orange/10 font-semibold text-base-white"
                  : "border-base-border text-base-muted hover:border-brand-orange/60 hover:text-base-white",
                sinStock && !activa && "line-through opacity-60"
              )}
              title={sinStock ? "Sin stock" : undefined}
            >
              {v.variante_etiqueta}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
