"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

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
  // El menú se "porta" a document.body (ver más abajo) en vez de quedar
  // anidado dentro del <header>, así que necesitamos saber que ya estamos
  // en el cliente (document no existe durante el render en el servidor).
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Mientras el menú está abierto, bloqueamos el scroll del fondo para que
  // no se pueda desplazar la página por detrás del overlay.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  const menu = (
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
                <ThemeToggle className="w-full rounded-lg px-3 py-3 text-left text-base hover:bg-base-surface" />
              </div>
            </nav>
          </div>
    </div>
  );

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

      {/* Se renderiza con un portal directo a document.body: si quedara
          anidado dentro del <header> (que tiene backdrop-blur), ese
          backdrop-filter crea un "containing block" propio para los hijos
          `fixed`, y el menú terminaba limitado a la altura del header en
          vez de cubrir toda la pantalla ("se veía cortado"). */}
      {abierto && montado && createPortal(menu, document.body)}
    </>
  );
}
