"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

interface Categoria {
  nombre: string;
  slug: string;
}

export function MobileMenu({
  categorias,
  cuentasActivas,
}: {
  categorias: Categoria[];
  cuentasActivas: boolean;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-base-white md:hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-base-dark p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold text-base-white">Menú</span>
              <button
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="rounded-lg p-2 text-base-muted"
              >
                ✕
              </button>
            </div>

            <SearchBar className="mb-5" />

            <nav className="flex flex-col gap-1 text-base-white">
              <Link href="/" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                Inicio
              </Link>
              <Link href="/productos" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                Tienda
              </Link>
              <Link href="/mi-moto" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                ¿Qué moto tenés?
              </Link>

              <span className="mt-3 px-3 text-xs font-bold uppercase text-base-muted">
                Categorías
              </span>
              {categorias.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categoria/${c.slug}`}
                  className="rounded-lg px-3 py-2.5 text-sm hover:bg-base-surface"
                  onClick={() => setAbierto(false)}
                >
                  {c.nombre}
                </Link>
              ))}

              <div className="mt-3 border-t border-base-border pt-3">
                <Link href="/nosotros" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                  Nosotros
                </Link>
                <Link href="/contacto" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                  Contacto
                </Link>
                {cuentasActivas && (
                  <Link href="/cuenta" className="rounded-lg px-3 py-3 text-base hover:bg-base-surface" onClick={() => setAbierto(false)}>
                    Mi cuenta
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
