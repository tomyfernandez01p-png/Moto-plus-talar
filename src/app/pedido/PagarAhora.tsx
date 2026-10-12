"use client";

import { useState } from "react";

/**
 * Reintenta abrir Mercado Pago para un pedido que todavía no se pagó. El
 * servidor solo genera el link para pedidos "sin pagar" o "pago pendiente".
 */
export function PagarAhora({ pedidoId }: { pedidoId: string }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    setError(null);
    setCargando(true);
    try {
      const respuesta = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId }),
      });
      const datos = await respuesta.json();
      if (datos.ok && datos.initPoint) {
        window.location.href = datos.initPoint;
        return;
      }
      setError("No pudimos abrir Mercado Pago ahora. Probá de nuevo en unos minutos.");
    } catch {
      setError("No pudimos abrir Mercado Pago ahora. Probá de nuevo en unos minutos.");
    }
    setCargando(false);
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={pagar}
        disabled={cargando}
        className="w-full rounded-xl bg-brand-orange py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-60"
      >
        {cargando ? "Abriendo Mercado Pago…" : "Pagar ahora"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
