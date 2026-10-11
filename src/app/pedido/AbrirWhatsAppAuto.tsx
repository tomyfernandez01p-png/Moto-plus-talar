"use client";

import { useEffect } from "react";

/**
 * Abre WhatsApp con el resumen del pedido ya escrito, una sola vez, justo
 * después de confirmar la compra. Se marca en sessionStorage para que
 * recargar o volver a la página no lo dispare de nuevo. WhatsApp no permite
 * enviar el mensaje solo: el cliente solo toca "Enviar".
 */
export function AbrirWhatsAppAuto({ href, clave }: { href: string; clave: string }) {
  useEffect(() => {
    let yaAbierto = false;
    try {
      yaAbierto = sessionStorage.getItem(clave) === "1";
      if (!yaAbierto) sessionStorage.setItem(clave, "1");
    } catch {
      // sin sessionStorage: se abre igual esta vez
    }
    if (yaAbierto) return;
    const t = setTimeout(() => {
      window.location.href = href;
    }, 2000);
    return () => clearTimeout(t);
  }, [href, clave]);

  return null;
}
