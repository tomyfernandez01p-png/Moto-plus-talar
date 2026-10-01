"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoPedido } from "@/types/database";

async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: perfil } = await supabase.from("perfiles").select("rol, activo").eq("id", user.id).single();
  if (!perfil || perfil.rol === "cliente" || !perfil.activo) throw new Error("Sin permisos.");
  return { supabase, userId: user.id };
}

export async function actualizarEstadoPedidoAction(pedidoId: string, formData: FormData) {
  const { supabase, userId } = await requireStaff();

  const nuevoEstado = String(formData.get("estado") || "") as EstadoPedido;
  const estadosValidos: EstadoPedido[] = [
    "nuevo",
    "pago_pendiente",
    "pago_aprobado",
    "confirmado",
    "preparando",
    "enviado",
    "entregado",
    "cancelado",
  ];
  if (!estadosValidos.includes(nuevoEstado)) throw new Error("Estado inválido.");

  const { data: actual } = await supabase.from("pedidos").select("estado").eq("id", pedidoId).single();
  if (!actual) throw new Error("Pedido no encontrado.");

  if (actual.estado === nuevoEstado) return;

  const { error } = await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", pedidoId);
  if (error) throw new Error(error.message);

  await supabase.from("historial_cambios").insert({
    tabla: "pedidos",
    registro_id: pedidoId,
    usuario_id: userId,
    accion: "cambio_estado",
    campo: "estado",
    valor_anterior: actual.estado,
    valor_nuevo: nuevoEstado,
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}

export async function guardarNotaPedidoAction(pedidoId: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const notas = String(formData.get("notas") || "").trim() || null;

  const { error } = await supabase.from("pedidos").update({ notas }).eq("id", pedidoId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/pedidos/${pedidoId}`);
}
