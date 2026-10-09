"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconWrench, IconClose } from "@/components/ui/Icons";

const UMBRAL_SCROLL_PX = 480;
// Además de las pantallas de una sola tarea: en carrito, checkout y ficha de
// producto el aviso flotante competía con el precio y el botón de comprar.
const RUTAS_OCULTAS = ["/mecanica", "/login", "/registro", "/carrito", "/checkout"];

/**
 * Botón flotante que aparece al bajar en la página (pedido del usuario:
 * "a medida que bajes que esté en un botón con efecto que te lleve a la
 * sección de turnos"). Posición espejada a WhatsAppFloat.tsx (izquierda en
 * vez de derecha, mismo offset de bottom-nav) para que nunca se superpongan.
 * Se puede cerrar con la X (pedido explícito: "poder cerrarse") -- se
 * vuelve a mostrar recién en la próxima carga de página, no queda oculto
 * para siempre por accidente. Oculto en /admin, en /mecanica (ya estás
 * ahí) y en las pantallas de una sola tarea.
 */
export function TurnosFloat() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > UMBRAL_SCROLL_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Si cambia de página, vuelve a poder mostrarse (el cierre es "para esta
  // vista", no un apagado permanente del botón).
  useEffect(() => {
    setCerrado(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (RUTAS_OCULTAS.some((r) => pathname === r)) return null;
  if (pathname?.startsWith("/producto/")) return null;

  const mostrar = visible && !cerrado;

  return (
    <div
      aria-hidden={!mostrar}
      className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex items-center transition-all duration-300 ease-smooth md:bottom-6 ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <Link
        href="/mecanica"
        aria-label="Pedir turno de mecánica"
        tabIndex={mostrar ? 0 : -1}
        className="flex items-center gap-2 rounded-full bg-base-dark py-3 pl-4 pr-3 text-sm font-semibold text-base-white shadow-card ring-1 ring-brand-orange/40 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-base-surface hover:shadow-card-hover"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
          <IconWrench className="h-3.5 w-3.5" />
        </span>
        Pedí tu turno
      </Link>
      <button
        type="button"
        onClick={() => setCerrado(true)}
        aria-label="Cerrar"
        tabIndex={mostrar ? 0 : -1}
        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-dark text-base-muted shadow-card ring-1 ring-base-border transition-colors hover:text-base-white"
      >
        <IconClose className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
