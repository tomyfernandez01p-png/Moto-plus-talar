"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrecio } from "@/lib/format";
import { isDataUrl } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { IconCart, IconClose } from "@/components/ui/Icons";

export default function CarritoPage() {
  const { items, subtotal, actualizarCantidad, quitar } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-base-surface text-base-muted">
          <IconCart className="h-7 w-7" />
        </span>
        <h1 className="mb-2 text-2xl font-bold text-base-white">Tu carrito está vacío</h1>
        <p className="mb-6 text-sm text-base-muted">Agregá productos para empezar tu compra.</p>
        <ButtonLink href="/productos">Ir a la tienda</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Tu carrito</h1>

      <ul className="flex flex-col gap-4">
        {items.map((item, i) => (
          <li
            key={item.productoId}
            style={{ animationDelay: `${i * 40}ms` }}
            className="flex animate-fade-in-up flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-4 transition-colors duration-200 hover:border-base-border/80 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-base-border bg-base-dark">
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
              <Link href={`/producto/${item.slug}`} className="font-medium text-base-white hover:text-brand-orange">
                {item.nombre}
              </Link>
              <span className="text-xs text-base-muted">Código: {item.codigo}</span>
              <span className="text-sm text-base-white">{formatPrecio(item.precio)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="flex items-center rounded-lg border border-base-border">
                <button
                  className="focus-ring px-3 py-1.5 text-base-white transition-colors hover:text-brand-orange"
                  onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                  aria-label="Restar"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-base-white">{item.cantidad}</span>
                <button
                  className="focus-ring px-3 py-1.5 text-base-white transition-colors hover:text-brand-orange disabled:opacity-30"
                  onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stockDisponible}
                  aria-label="Sumar"
                >
                  +
                </button>
              </div>
              <span className="w-24 text-right font-semibold text-base-white">
                {formatPrecio(item.precio * item.cantidad)}
              </span>
              <button
                onClick={() => quitar(item.productoId)}
                aria-label="Quitar producto"
                className="focus-ring rounded-lg p-1.5 text-base-muted hover:bg-red-500/10 hover:text-red-400"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-3 border-t border-base-border pt-6">
        <div className="flex items-center gap-3 text-lg">
          <span className="text-base-muted">Subtotal</span>
          <span className="font-bold text-base-white">{formatPrecio(subtotal)}</span>
        </div>
        <ButtonLink href="/checkout" size="lg" className="hover:shadow-glow-sm">
          Finalizar compra →
        </ButtonLink>
      </div>
    </div>
  );
}
