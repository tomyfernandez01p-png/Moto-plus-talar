"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose } from "@/components/ui/Icons";

const UMBRAL_SCROLL_PX = 480;
// Además de las pantallas de una sola tarea: en carrito, checkout y ficha de
// producto el aviso flotante competía con el precio y el botón de comprar.
const RUTAS_OCULTAS = ["/mecanica", "/login", "/registro", "/carrito", "/checkout"];

const ENGRANAJE = "M19.6 -3.9 L24.8 -2.7 L24.8 2.7 L19.6 3.9 L18.2 8.4 L21.7 12.4 L18.5 16.8 L13.6 14.7 L9.8 17.4 L10.3 22.8 L5.1 24.5 L2.4 19.9 L-2.4 19.9 L-5.1 24.5 L-10.3 22.8 L-9.8 17.4 L-13.6 14.7 L-18.5 16.8 L-21.7 12.4 L-18.2 8.4 L-19.6 3.9 L-24.8 2.7 L-24.8 -2.7 L-19.6 -3.9 L-18.2 -8.4 L-21.7 -12.4 L-18.5 -16.8 L-13.6 -14.7 L-9.8 -17.4 L-10.3 -22.8 L-5.1 -24.5 L-2.4 -19.9 L2.4 -19.9 L5.1 -24.5 L10.3 -22.8 L9.8 -17.4 L13.6 -14.7 L18.5 -16.8 L21.7 -12.4 L18.2 -8.4Z";

/**
 * Botón flotante que aparece al bajar en la página y lleva a /mecanica (el
 * formulario de turnos que ya existe). Diseño racing: forma angular con
 * esquinas cortadas, borde naranja, fondo propio (carbono + franjas + panal,
 * ver .turno-fondo en globals.css), engranaje metálico con herramientas
 * cruzadas y flecha doble en círculo naranja. Una sola animación de entrada
 * (suave); al pasar el mouse / tocar solo se mueve un poco y se enciende el
 * borde -- nada parpadea. Posición espejada a WhatsAppFloat (izquierda vs
 * derecha, mismo offset de la barra inferior) y con ancho acotado para no
 * pisarlo en celulares. Se puede cerrar con la X; vuelve en la próxima vista.
 * Oculto en /admin, /mecanica y pantallas de una sola tarea.
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
      className={`fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 z-40 transition-all duration-500 ease-smooth md:bottom-6 md:left-4 ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <Link
        href="/mecanica"
        aria-label="Solicitar turno de mecánica en Moto Plus Talar"
        tabIndex={mostrar ? 0 : -1}
        className="group turno-clip block w-[min(17rem,calc(100vw-7.75rem))] bg-gradient-to-br from-brand-orange-light via-brand-orange to-brand-orange-dark p-[1.5px] shadow-[0_6px_24px_-6px_rgba(0,0,0,0.7),0_0_22px_-10px_rgb(var(--color-brand)/0.6)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8),0_0_30px_-6px_rgb(var(--color-brand)/0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span className="turno-clip-in turno-fondo relative flex items-center gap-2.5 py-2 pl-2 pr-2">
          {/* engranaje metálico con herramientas cruzadas */}
          <svg
            aria-hidden
            viewBox="-28 -28 56 56"
            className="h-12 w-12 shrink-0 drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-smooth group-hover:rotate-[30deg]"
          >
            <defs>
              <radialGradient id="turno-metal" cx="35%" cy="30%" r="80%">
                <stop offset="0" stopColor="#f4f4f5" />
                <stop offset="0.45" stopColor="#a1a1aa" />
                <stop offset="1" stopColor="#3f3f46" />
              </radialGradient>
              <radialGradient id="turno-hub" cx="50%" cy="50%" r="60%">
                <stop offset="0" stopColor="#26262b" />
                <stop offset="1" stopColor="#0d0d10" />
              </radialGradient>
            </defs>
            <path d={ENGRANAJE} fill="url(#turno-metal)" stroke="#18181b" strokeWidth="0.8" strokeLinejoin="round" />
            <circle r="15.5" fill="url(#turno-hub)" stroke="#d4d4d8" strokeOpacity="0.55" strokeWidth="0.8" />
          </svg>
          {/* herramientas cruzadas: no giran con el engranaje */}
          <svg aria-hidden viewBox="-28 -28 56 56" className="pointer-events-none absolute left-2 h-12 w-12">
            <g transform="rotate(-45)">
              <rect x="-1.4" y="-12" width="2.8" height="17" rx="0.8" fill="#e4e4e7" />
              <rect x="-3.2" y="4" width="6.4" height="9" rx="2" fill="rgb(255,106,0)" />
            </g>
            <g transform="rotate(45)">
              <rect x="-1.8" y="-6" width="3.6" height="19" rx="1.2" fill="#d4d4d8" />
              <circle cy="-9" r="4.8" fill="#f4f4f5" />
              <rect x="-1.7" y="-14" width="3.4" height="6.5" fill="#0d0d10" />
            </g>
          </svg>
          <span className="min-w-0 flex-1 leading-none">
            <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-brand-orange-light">
              Moto Plus Talar
            </span>
            <span className="mt-1 block truncate text-[1.05rem] font-extrabold italic tracking-tight text-white">
              Solicitar turno
            </span>
          </span>
          {/* flecha doble en círculo naranja */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-[0_0_14px_-2px_rgb(var(--color-brand)/0.8)] ring-1 ring-white/20 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l6 6-6 6" />
              <path d="M12.5 6l6 6-6 6" />
            </svg>
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => setCerrado(true)}
        aria-label="Cerrar"
        tabIndex={mostrar ? 0 : -1}
        className="absolute -right-1.5 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#141417] text-base-muted shadow-card ring-1 ring-white/20 transition-colors hover:text-white"
      >
        <IconClose className="h-3 w-3" />
      </button>
    </div>
  );
}
