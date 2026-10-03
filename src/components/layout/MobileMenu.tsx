"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import {
  IconMenu,
  IconClose,
  IconChevronRight,
  IconChevronDown,
  IconWhatsApp,
  IconInstagram,
  IconMapPin,
  IconUser,
  IconHeart,
} from "@/components/ui/Icons";
import { whatsappLink, mapsComoLlegarUrl, type Configuracion } from "@/lib/config";
import { mensajeGenerico } from "@/lib/whatsapp";

interface Categoria {
  nombre: string;
  slug: string;
}

/**
 * Menú mobile (brief #21): panel oscuro con logo+cerrar arriba, navegación
 * principal con flecha, categorías desplegables, cuenta, y una zona
 * inferior con WhatsApp/Instagram/info del local. Ninguna referencia a
 * /admin (brief #21/#34). Se sigue "porteando" a document.body (ver
 * comentario abajo) para evitar el bug de containing-block del header con
 * backdrop-blur.
 */
export function MobileMenu({
  categorias,
  config,
}: {
  categorias: Categoria[];
  config: Configuracion;
}) {
  const [abierto, setAbierto] = useState(false);
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  function cerrar() {
    setAbierto(false);
  }

  const navPrincipal = [
    { href: "/productos", label: "Productos" },
    { href: "/categorias", label: "Categorías" },
    { href: "/productos?oferta=1", label: "Ofertas" },
    { href: "/marcas", label: "Marcas" },
    { href: "/mi-moto", label: "¿Qué moto tenés?" },
    { href: "/mecanica", label: "Turno de mecánica" },
    { href: "/preguntas-frecuentes", label: "Ayuda" },
    { href: "/contacto", label: "Contacto" },
  ];

  const menu = (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        aria-label="Cerrar menú"
        onClick={cerrar}
      />
      <div className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm animate-slide-in-left flex-col overflow-y-auto border-r border-base-border bg-base-dark">
        <div className="flex items-center justify-between border-b border-base-border px-5 py-4">
          <span className="text-lg font-extrabold tracking-tight text-base-white">
            {config.nombre_negocio}
          </span>
          <button
            onClick={cerrar}
            aria-label="Cerrar"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-base-muted hover:bg-base-surface hover:text-base-white"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <SearchBar autoFocus={false} />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4 text-base-white">
          <Link
            href="/"
            onClick={cerrar}
            className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors hover:bg-base-surface"
          >
            Inicio
          </Link>

          {navPrincipal.map((item) =>
            item.label === "Categorías" && categorias.length > 0 ? (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => setCategoriasAbiertas((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors hover:bg-base-surface"
                  aria-expanded={categoriasAbiertas}
                >
                  Categorías
                  <IconChevronDown
                    className={`h-4 w-4 text-base-muted transition-transform duration-200 ${categoriasAbiertas ? "rotate-180" : ""}`}
                  />
                </button>
                {categoriasAbiertas && (
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-base-border pl-3">
                    {categorias.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/categoria/${c.slug}`}
                        onClick={cerrar}
                        className="rounded-lg px-3 py-2.5 text-sm text-base-muted transition-colors hover:bg-base-surface hover:text-base-white"
                      >
                        {c.nombre}
                      </Link>
                    ))}
                    <Link
                      href="/categorias"
                      onClick={cerrar}
                      className="rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-orange hover:bg-base-surface"
                    >
                      Ver todas →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={cerrar}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors hover:bg-base-surface"
              >
                {item.label}
                <IconChevronRight className="h-4 w-4 text-base-muted" />
              </Link>
            )
          )}

          <div className="mt-2 flex flex-col gap-0.5 border-t border-base-border pt-2">
            <Link
              href="/favoritos"
              onClick={cerrar}
              className="flex items-center gap-2.5 rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors hover:bg-base-surface"
            >
              <IconHeart className="h-4 w-4 text-base-muted" />
              Favoritos
            </Link>
            {config.cuentas_clientes_activas && (
              <Link
                href="/cuenta"
                onClick={cerrar}
                className="flex items-center gap-2.5 rounded-xl px-3 py-3.5 text-[15px] font-medium transition-colors hover:bg-base-surface"
              >
                <IconUser className="h-4 w-4 text-base-muted" />
                Cuenta
              </Link>
            )}
            <ThemeToggle className="rounded-xl px-3 py-3.5 text-left text-[15px] font-medium hover:bg-base-surface" />
          </div>
        </nav>

        {/* zona inferior: whatsapp / instagram / info del local (brief #21).
            Nunca una referencia a /admin acá. */}
        <div className="mt-auto flex flex-col gap-3 border-t border-base-border bg-base-black/40 p-5">
          {config.whatsapp_link && (
            <a
              href={whatsappLink(config, mensajeGenerico())}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
            >
              <IconWhatsApp className="h-5 w-5" />
              Escribinos por WhatsApp
            </a>
          )}
          <div className="flex items-center justify-between text-xs text-base-muted">
            {config.instagram_url && (
              <a
                href={config.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-base-white"
              >
                <IconInstagram className="h-4 w-4" /> Instagram
              </a>
            )}
            {config.direccion && (
              <a
                href={mapsComoLlegarUrl(config)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-right hover:text-base-white"
              >
                <IconMapPin className="h-4 w-4 shrink-0" />
                {config.direccion}
                {config.ciudad ? `, ${config.ciudad}` : ""}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="focus-ring flex h-11 w-11 items-center justify-center rounded-lg text-base-white md:hidden"
      >
        <IconMenu className="h-6 w-6" />
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
