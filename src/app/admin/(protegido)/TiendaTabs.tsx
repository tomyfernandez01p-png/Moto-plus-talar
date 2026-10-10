"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Barra de pestañas de la sección "Tienda" del admin: agrupa todo lo que se
 * configura del shop. Solo se muestra dentro de las rutas de la tienda; el
 * resto del panel (pedidos, clientes, etc.) no la ve. No cambia ninguna ruta
 * ni regla de acceso: la pestaña Configuración solo se pasa para
 * administradores y esa página sigue validando el rol por su cuenta.
 */
export const TIENDA_TABS = [
  { href: "/admin/tienda", label: "Resumen", match: (p: string) => p === "/admin/tienda" },
  {
    href: "/admin/productos",
    label: "Productos",
    match: (p: string) => p.startsWith("/admin/productos") && !p.startsWith("/admin/productos/importar-catalogo"),
  },
  { href: "/admin/categorias", label: "Categorías", match: (p: string) => p.startsWith("/admin/categorias") },
  { href: "/admin/banners", label: "Banners", match: (p: string) => p.startsWith("/admin/banners") },
  {
    href: "/admin/productos/importar-catalogo",
    label: "Fotos y logos",
    match: (p: string) => p.startsWith("/admin/productos/importar-catalogo"),
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    match: (p: string) => p.startsWith("/admin/configuracion"),
    soloAdmin: true,
  },
] as const;

export function TiendaTabs({ esAdmin }: { esAdmin: boolean }) {
  const pathname = usePathname() ?? "";
  const enTienda = TIENDA_TABS.some((t) => t.href !== "/admin/tienda" && t.match(pathname)) || pathname === "/admin/tienda";
  if (!enTienda) return null;

  return (
    <nav aria-label="Tienda" className="mb-6 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-1 border-b border-base-border">
        {TIENDA_TABS.filter((t) => !("soloAdmin" in t) || esAdmin).map((t) => {
          const activa = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={activa ? "page" : undefined}
                className={cn(
                  "-mb-px block whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  activa
                    ? "border-brand-orange text-base-white"
                    : "border-transparent text-base-muted hover:text-base-white"
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
