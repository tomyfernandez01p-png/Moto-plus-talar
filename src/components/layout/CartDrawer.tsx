"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrecio } from "@/lib/format";
import { isDataUrl } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";

export function CartDrawer() {
  const { items, abierto, setAbierto, subtotal, actualizarCantidad, quitar } = useCart();

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-black/60"
        onClick={() => setAbierto(false)}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-base-dark border-l border-base-border">
        <div className="flex items-center justify-between border-b border-base-border p-4">
          <h2 className="text-lg font-bold text-base-white">Tu carrito</h2>
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-base-muted hover:bg-base-surface"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-sm text-base-muted mt-10">Tu carrito está vacío.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productoId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-base-surface">
                    {item.imagen && (
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        unoptimized={isDataUrl(item.imagen)}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={() => setAbierto(false)}
                      className="line-clamp-2 text-sm font-medium text-base-white hover:text-brand-orange"
                    >
                      {item.nombre}
                    </Link>
                    <span className="text-xs text-base-muted">{formatPrecio(item.precio)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-base-border">
                        <button
                          className="px-2 py-1 text-base-white"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm text-base-white">
                          {item.cantidad}
                        </span>
                        <button
                          className="px-2 py-1 text-base-white"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                          aria-label="Sumar"
                          disabled={item.cantidad >= item.stockDisponible}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => quitar(item.productoId)}
                        className="text-xs text-base-muted underline hover:text-red-400"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-base-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-base-muted">Subtotal</span>
              <span className="text-lg font-bold text-base-white">{formatPrecio(subtotal)}</span>
            </div>
            <ButtonLink
              href="/checkout"
              onClick={() => setAbierto(false)}
              className="w-full"
              size="lg"
            >
              Finalizar compra
            </ButtonLink>
            <ButtonLink
              href="/carrito"
              onClick={() => setAbierto(false)}
              variant="ghost"
              className="mt-2 w-full"
            >
              Ver carrito completo
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
}
