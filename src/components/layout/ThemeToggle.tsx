"use client";

import { useEffect, useState } from "react";

/**
 * Botón "Tema: 🌙 Oscuro / ☀️ Claro" que alterna la clase `theme-light` en
 * <html>. Las variables CSS que definen esa clase están en globals.css, y
 * todas las clases `bg-base-*`/`text-base-*` del sitio ya las usan, así que
 * no hace falta tocar ningún otro componente para que cambien de color.
 *
 * El estado inicial siempre arranca en `false` (oscuro) para que coincida
 * con el HTML que renderiza el servidor y no haya un mismatch de
 * hidratación; el script "beforeInteractive" en layout.tsx ya aplicó la
 * clase correcta antes del primer paint si el usuario había elegido claro,
 * y este useEffect solo sincroniza el estado de React con el DOM.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [esClaro, setEsClaro] = useState(false);

  useEffect(() => {
    setEsClaro(document.documentElement.classList.contains("theme-light"));
  }, []);

  function alternar() {
    const siguiente = !esClaro;
    setEsClaro(siguiente);
    document.documentElement.classList.toggle("theme-light", siguiente);
    try {
      localStorage.setItem("theme", siguiente ? "light" : "dark");
    } catch {
      // localStorage puede no estar disponible (modo privado, etc.); el
      // toggle sigue funcionando para la sesión actual.
    }
  }

  return (
    <button type="button" onClick={alternar} className={className}>
      Tema: {esClaro ? "☀️ Claro" : "🌙 Oscuro"}
    </button>
  );
}
