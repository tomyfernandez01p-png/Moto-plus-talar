"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function AddToCartActions({ producto }: { producto: VistaProducto }) {
  const { agregar, setAbierto } = useCart();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const sinStock = producto.estado_stock === "sin_stock";

  function item() {
    return {
      productoId: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      codigo: producto.codigo,
      precio: producto.precio_vigente,
      imagen: producto.imagen_principal_url,
      stockDisponible: producto.stock,
    };
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-base-border">
          <button
            className="px-3 py-2 text-base-white"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            aria-label="Restar cantidad"
          >
            −
          </button>
          <span className="min-w-[2.5ch] text-center text-base-white">{cantidad}</span>
          <button
            className="px-3 py-2 text-base-white"
            onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
            aria-label="Sumar cantidad"
          >
            +
          </button>
        </div>
        <span className="text-xs text-base-muted">{producto.stock} disponibles</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          disabled={sinStock}
          onClick={() => agregar(item(), cantidad)}
          className="flex-1 rounded-xl border border-brand-orange bg-transparent py-3 text-sm font-semibold text-brand-orange transition-colors hover:bg-brand-orange/10 disabled:opacity-50"
        >
          Agregar al carrito
        </button>
        <button
          disabled={sinStock}
          onClick={() => {
            agregar(item(), cantidad);
            setAbierto(false);
            router.push("/checkout");
          }}
          className="flex-1 rounded-xl bg-brand-orange py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-50"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
