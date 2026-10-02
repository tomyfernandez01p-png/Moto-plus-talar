"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrecio } from "@/lib/format";
import { isDataUrl } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { IconCart, IconClose } from "@/components/ui/Icons";

export function CartDrawer() {
  const { items, abierto, setAbierto, subtotal, actualizarCantidad, quitar } = useCart();

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 animate-fade-in bg-black/60 backdrop-blur-sm"
        onClick={() => setAbierto(false)}
      />
      <div className="relative flex h-full w-full max-w-md animate-slide-in-right flex-col border-l border-base-border bg-base-dark">
        <div className="flex items-center justify-between border-b border-base-border p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-base-white">
            <IconCart className="h-5 w-5 text-brand-orange" />
            Tu carrito
          </h2>
          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
            className="focus-ring rounded-lg p-2 text-base-muted hover:bg-base-surface hover:text-base-white"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="mt-10 flex flex-col items-center text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-base-surface text-base-muted">
                <IconCart className="h-6 w-6" />
              </span>
              <p className="text-sm text-base-muted">Tu carrito está vacío.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productoId} className="flex animate-fade-in-up gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-base-border bg-base-surface">
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
                    <span className="text-xs font-semibold text-base-white">{formatPrecio(item.precio)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-base-border">
                        <button
                          className="focus-ring px-2.5 py-1 text-base-white transition-colors hover:text-brand-orange"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="min-w-[2ch] text-center text-sm text-base-white">
                          {item.cantidad}
                        </span>
                        <button
                          className="focus-ring px-2.5 py-1 text-base-white transition-colors hover:text-brand-orange disabled:opacity-30"
                          onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                          aria-label="Sumar"
                          disabled={item.cantidad >= item.stockDisponible}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => quitar(item.productoId)}
                        className="text-xs text-base-muted underline-offset-2 hover:text-red-400 hover:underline"
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
          <div className="border-t border-base-border bg-base-black/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-base-muted">Subtotal</span>
              <span className="text-lg font-bold text-base-white">{formatPrecio(subtotal)}</span>
            </div>
            <ButtonLink
              href="/checkout"
              onClick={() => setAbierto(false)}
              className="w-full hover:shadow-glow-sm"
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
