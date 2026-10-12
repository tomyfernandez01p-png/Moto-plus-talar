"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatFecha, formatPrecio } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { leerPedidosLocales } from "@/lib/pedidos-locales";
import { pedidosPorIdsAction, type PedidoResumen } from "./actions";

const estadoLabel: Record<string, string> = {
  nuevo: "Sin pagar",
  pago_pendiente: "Pago pendiente",
  pago_aprobado: "Pago aprobado",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

/**
 * Lista de pedidos del cliente: los de su cuenta (si inició sesión) más los
 * que hizo en este navegador sin cuenta, sin repetir ninguno.
 */
export function MisPedidosLista({ deCuenta }: { deCuenta: PedidoResumen[] }) {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>(deCuenta);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const idsCuenta = new Set(deCuenta.map((p) => p.id));
    const locales = leerPedidosLocales().filter((id) => !idsCuenta.has(id));
    if (locales.length === 0) {
      setCargando(false);
      return;
    }
    pedidosPorIdsAction(locales)
      .then((extra) => {
        if (cancelado) return;
        const todos = [...deCuenta, ...extra].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setPedidos(todos);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [deCuenta]);

  if (cargando && pedidos.length === 0) {
    return <p className="text-sm text-base-muted">Buscando tus pedidos…</p>;
  }

  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-base-border bg-base-surface p-6">
        <p className="text-sm text-base-muted">
          Todavía no hay pedidos en este navegador. Si compraste desde otro dispositivo, iniciá
          sesión con el mismo email para verlos.
        </p>
        <ButtonLink href="/productos">Ir a la tienda</ButtonLink>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {pedidos.map((p) => (
        <li key={p.id}>
          <Link
            href={`/pedido/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-base-border bg-base-surface p-4 hover:border-brand-orange/50"
          >
            <div>
              <p className="font-semibold text-base-white">Pedido #{p.numero}</p>
              <p className="text-xs text-base-muted">{formatFecha(p.created_at)}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="font-semibold text-base-white">{formatPrecio(p.total)}</span>
              <Badge tono="neutral">{estadoLabel[p.estado] ?? p.estado}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
