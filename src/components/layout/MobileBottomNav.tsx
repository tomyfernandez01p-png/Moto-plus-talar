"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";
import { cn } from "@/lib/utils";
import { IconHome, IconSearch, IconGrid, IconCart, IconUser } from "@/components/ui/Icons";

/**
 * Barra de navegación inferior fija en mobile (brief #20): Inicio / Buscar /
 * Explorar / Carrito / Cuenta. Nunca se muestra en desktop (md:hidden) ni
 * en /admin -- el panel de administración tiene su propia navegación y debe
 * quedar completamente separado del sitio público (brief #21/#34).
 *
 * La tercera pestaña apuntaba a /categorias (solo tarjetas de categoría, sin
 * productos). Pedido del usuario: que diga "Explorar" y ahí esté toda la
 * mercadería -- apunta a /productos (el catálogo completo) en vez de a la
 * grilla de categorías.
 */
export function MobileBottomNav({ cuentasActivas }: { cuentasActivas: boolean }) {
  const pathname = usePathname();
  const { cantidadTotal, setAbierto } = useCart();

  if (pathname?.startsWith("/admin")) return null;

  const esActivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const itemClass = (activo: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors duration-150",
      activo ? "text-brand-orange" : "text-base-muted hover:text-base-white"
    );

  return (
    <Fragment>
      {/* espacio para que la barra fixed no tape el final del footer ni el
          último contenido al hacer scroll (solo cuando la barra existe);
          mismo alto que la barra, incluida la safe-area del teléfono */}
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Navegación principal"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-base-border/70 bg-base-black/90 backdrop-blur-lg md:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch">
          <Link href="/" className={itemClass(esActivo("/"))}>
            <IconHome className={cn("h-5 w-5", esActivo("/") && "scale-110")} />
            Inicio
          </Link>
          <Link href="/buscar" className={itemClass(esActivo("/buscar"))}>
            <IconSearch className="h-5 w-5" />
            Buscar
          </Link>
          <Link href="/productos" className={itemClass(esActivo("/productos") || esActivo("/categoria"))}>
            <IconGrid className="h-5 w-5" />
            Explorar
          </Link>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className={cn(itemClass(false), "relative")}
            aria-label={`Carrito, ${cantidadTotal} productos`}
          >
            <span className="relative">
              <IconCart className="h-5 w-5" />
              {cantidadTotal > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-orange px-1 text-[9px] font-bold text-white">
                  {cantidadTotal}
                </span>
              )}
            </span>
            Carrito
          </button>
          {cuentasActivas && (
            <Link href="/cuenta" className={itemClass(esActivo("/cuenta") || esActivo("/login"))}>
              <IconUser className="h-5 w-5" />
              Cuenta
            </Link>
          )}
        </div>
      </nav>
    </Fragment>
  );
}
