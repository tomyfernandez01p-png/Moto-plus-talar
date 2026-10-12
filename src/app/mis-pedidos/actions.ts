"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface PedidoResumen {
  id: string;
  numero: number;
  estado: string;
  total: number;
  created_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Devuelve el resumen de los pedidos cuyos ids guardó este navegador.
 * Conocer el UUID de un pedido es la credencial para verlo (mismo criterio
 * que /pedido/[id]); solo se devuelven campos de resumen, sin datos personales.
 */
export async function pedidosPorIdsAction(ids: string[]): Promise<PedidoResumen[]> {
  const validos = Array.from(new Set((ids ?? []).filter((x) => typeof x === "string" && UUID.test(x)))).slice(0, 30);
  if (validos.length === 0) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select("id, numero, estado, total, created_at")
    .in("id", validos)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("pedidosPorIds", error);
    return [];
  }
  return (data ?? []).map((p) => ({
    id: p.id,
    numero: p.numero,
    estado: String(p.estado),
    total: Number(p.total),
    created_at: p.created_at,
  }));
}
