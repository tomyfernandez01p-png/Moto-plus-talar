"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";
import { CartButton } from "./CartButton";
import { AccountButton } from "./AccountButton";
import { IconChevronDown } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import type { Configuracion } from "@/lib/config";

interface Categoria {
  nombre: string;
  slug: string;
}

/**
 * Fila principal del header, separada en un Client Component solo para
 * poder reaccionar al scroll (brief #4: "al hacer scroll puede reducir
 * ligeramente su altura"). El resto del header (franja de anuncio, franja
 * superior desktop) sigue renderizado en el Server Component `Header`.
 */
export function HeaderMainRow({
  config,
  categorias,
}: {
  config: Configuracion;
  categorias: Categoria[];
}) {
  const [encogido, setEncogido] = useState(false);

  useEffect(() => {
    function onScroll() {
      setEncogido(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "mx-auto flex max-w-7xl items-center gap-4 px-4 transition-[padding] duration-300 ease-smooth md:px-6",
        encogido ? "py-2" : "py-3"
      )}
    >
      <MobileMenu categorias={categorias} config={config} />

      <Link href="/" className="flex shrink-0 items-center gap-2">
        <div
          className={cn(
            "relative overflow-hidden rounded-full transition-all duration-300 ease-smooth",
            encogido ? "h-8 w-8" : "h-10 w-10"
          )}
        >
          <Image
            src={config.logo_url || "/brand/logo-placeholder.svg"}
            alt={config.nombre_negocio}
            fill
            className="object-cover"
          />
        </div>
        <span className="hidden text-lg font-extrabold tracking-tight text-base-white sm:block">
          {config.nombre_negocio}
        </span>
      </Link>

      <SearchBar className="mx-2 hidden flex-1 md:block" />

      <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-base-white md:flex">
        <Link href="/" className="transition-colors hover:text-brand-orange">
          Inicio
        </Link>
        {categorias.length > 0 && (
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 transition-colors hover:text-brand-orange"
            >
              Categorías
              <IconChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-0 top-full z-40 w-64 translate-y-1 rounded-xl border border-base-border bg-base-dark p-2 opacity-0 shadow-card transition-all duration-200 ease-smooth group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {categorias.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className="block rounded-lg px-3 py-2 text-sm font-normal text-base-white hover:bg-base-surface hover:text-brand-orange"
                >
                  {c.nombre}
                </Link>
              ))}
              <Link
                href="/categorias"
                className="mt-1 block rounded-lg border-t border-base-border px-3 py-2 text-sm font-semibold text-brand-orange hover:bg-base-surface"
              >
                Ver todas →
              </Link>
            </div>
          </div>
        )}
        <Link href="/productos" className="transition-colors hover:text-brand-orange">
          Tienda
        </Link>
        <Link href="/marcas" className="transition-colors hover:text-brand-orange">
          Marcas
        </Link>
        <Link href="/mi-moto" className="transition-colors hover:text-brand-orange">
          ¿Qué moto tenés?
        </Link>
        <Link href="/mecanica" className="transition-colors hover:text-brand-orange">
          Mecánica
        </Link>
        <Link href="/nosotros" className="transition-colors hover:text-brand-orange">
          Nosotros
        </Link>
        <Link href="/contacto" className="transition-colors hover:text-brand-orange">
          Contacto
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        {config.cuentas_clientes_activas && <AccountButton />}
        <CartButton />
      </div>
    </div>
  );
}
