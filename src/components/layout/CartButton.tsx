"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { cantidadTotal, setAbierto } = useCart();
  const [bump, setBump] = useState(false);
  const anteriorRef = useRef(cantidadTotal);

  // feedback visual al agregar al carrito: el badge "rebota" cuando sube la cantidad
  useEffect(() => {
    if (cantidadTotal > anteriorRef.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      anteriorRef.current = cantidadTotal;
      return () => clearTimeout(t);
    }
    anteriorRef.current = cantidadTotal;
  }, [cantidadTotal]);

  return (
    <button
      onClick={() => setAbierto(true)}
      aria-label={`Carrito, ${cantidadTotal} productos`}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg text-base-white hover:bg-base-surface"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 0 0 5.6 19H17M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      </svg>
      {cantidadTotal > 0 && (
        <span
          className={cn(
            "absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-orange px-1 text-[11px] font-bold text-white",
            bump && "animate-bump"
          )}
        >
          {cantidadTotal}
        </span>
      )}
    </button>
  );
}
