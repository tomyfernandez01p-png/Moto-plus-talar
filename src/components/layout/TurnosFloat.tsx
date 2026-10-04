"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconWrench } from "@/components/ui/Icons";

const UMBRAL_SCROLL_PX = 480;
const RUTAS_OCULTAS = ["/mecanica", "/login", "/registro"];

/**
 * Botón flotante que aparece al bajar en la página (pedido del usuario:
 * "a medida que bajes que esté en un botón con efecto que te lleve a la
 * sección de turnos"). Posición espejada a WhatsAppFloat.tsx (izquierda en
 * vez de derecha, mismo offset de bottom-nav) para que nunca se superpongan.
 * Oculto en /admin (brief #21/#34: admin separado del sitio público), en
 * /mecanica (ya estás ahí) y en las pantallas de una sola tarea.
 */
export function TurnosFloat() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > UMBRAL_SCROLL_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (RUTAS_OCULTAS.some((r) => pathname === r)) return null;

  return (
    <Link
      href="/mecanica"
      aria-label="Pedir turno de mecánica"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-40 flex items-center gap-2 rounded-full bg-base-dark px-4 py-3 text-sm font-semibold text-base-white shadow-card ring-1 ring-brand-orange/40 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-base-surface hover:shadow-card-hover md:bottom-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
        <IconWrench className="h-3.5 w-3.5" />
      </span>
      Pedí tu turno
    </Link>
  );
}
