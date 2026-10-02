"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { FavoritoButton } from "@/components/product/FavoritoButton";
import { IconCart } from "@/components/ui/Icons";
import { useCart } from "@/lib/cart/cart-context";
import { cn, isDataUrl } from "@/lib/utils";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function ProductCard({ producto }: { producto: VistaProducto }) {
  const { agregar } = useCart();
  const sinStock = producto.estado_stock === "sin_stock";
  const [agregado, setAgregado] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-base-border bg-base-surface transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-card-hover">
      <Link href={`/producto/${producto.slug}`} className="relative block aspect-square bg-base-dark">
        {producto.imagen_principal_url ? (
          <Image
            src={producto.imagen_principal_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized={isDataUrl(producto.imagen_principal_url)}
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-base-muted">
            Sin imagen
          </div>
        )}
        {/* overlay sutil para que los badges/corazón siempre se lean, incluso sobre fotos claras */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent"
        />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {producto.en_oferta && (
            <Badge tono="orange" className="shadow-glow-sm">
              -
              {producto.precio_anterior
                ? Math.round((1 - producto.precio_vigente / producto.precio_anterior) * 100)
                : ""}
              %
            </Badge>
          )}
          {producto.es_nuevo && !producto.en_oferta && <Badge tono="neutral">Nuevo</Badge>}
        </div>
        <FavoritoButton productoId={producto.id} size="sm" className="absolute right-2 top-2" />
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
          className="line-clamp-2 text-sm font-medium text-base-white transition-colors hover:text-brand-orange"
        >
          {producto.nombre}
        </Link>
        <span className="text-[11px] text-base-muted">Código: {producto.codigo}</span>
        <Price precio={producto.precio_vigente} precioAnterior={producto.precio_anterior} size="sm" />

        {producto.estado_stock === "ultimas_unidades" && (
          <span className="text-xs font-semibold text-brand-orange">● Últimas unidades</span>
        )}
        {producto.estado_stock === "disponible" && (
          <span className="text-xs font-medium text-emerald-500">● En stock</span>
        )}
        {producto.estado_stock === "consultar" && (
          <span className="text-xs font-medium text-base-muted">● Consultar disponibilidad</span>
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
            "mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:bg-base-border disabled:text-base-muted",
            agregado
              ? "bg-emerald-600"
              : "bg-brand-orange hover:bg-brand-orange-dark hover:shadow-glow-sm active:scale-[0.96]"
          )}
        >
          {sinStock ? (
            "Sin stock"
          ) : agregado ? (
            "✓ Agregado"
          ) : (
            <>
              <IconCart className="h-4 w-4" /> Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
