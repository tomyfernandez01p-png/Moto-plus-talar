"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/lib/cart/cart-context";
import { cn, isDataUrl } from "@/lib/utils";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function ProductCard({ producto }: { producto: VistaProducto }) {
  const { agregar } = useCart();
  const sinStock = producto.estado_stock === "sin_stock";
  const [agregado, setAgregado] = useState(false);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-base-border bg-base-surface overflow-hidden transition-all duration-300 ease-smooth hover:border-brand-orange/50 hover:shadow-card-hover">
      <Link href={`/producto/${producto.slug}`} className="relative block aspect-square bg-base-dark">
        {producto.imagen_principal_url ? (
          <Image
            src={producto.imagen_principal_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized={isDataUrl(producto.imagen_principal_url)}
            className="object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-muted text-sm">
            Sin imagen
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {producto.en_oferta && <Badge tono="orange">Oferta</Badge>}
          {producto.es_nuevo && !producto.en_oferta && <Badge tono="neutral">Nuevo</Badge>}
        </div>
        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Badge tono="danger">Sin stock</Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {producto.marca_nombre && (
          <span className="text-xs uppercase tracking-wide text-base-muted">
            {producto.marca_nombre}
          </span>
        )}
        <Link
          href={`/producto/${producto.slug}`}
          className="line-clamp-2 text-sm font-medium text-base-white hover:text-brand-orange"
        >
          {producto.nombre}
        </Link>
        <Price precio={producto.precio_vigente} precioAnterior={producto.precio_anterior} size="sm" />

        {producto.estado_stock === "ultimas_unidades" && (
          <span className="text-xs font-semibold text-brand-orange">Últimas unidades</span>
        )}

        <button
          type="button"
          disabled={sinStock}
          onClick={() => {
            agregar({
              productoId: producto.id,
              nombre: producto.nombre,
              slug: producto.slug,
              codigo: producto.codigo,
              precio: producto.precio_vigente,
              imagen: producto.imagen_principal_url,
              stockDisponible: producto.stock,
            });
            setAgregado(true);
            setTimeout(() => setAgregado(false), 1200);
          }}
          className={cn(
            "mt-1 w-full rounded-lg py-2 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-base-border disabled:text-base-muted",
            agregado ? "bg-emerald-600" : "bg-brand-orange hover:bg-brand-orange-dark active:scale-[0.97]"
          )}
        >
          {sinStock ? "Sin stock" : agregado ? "✓ Agregado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
}
