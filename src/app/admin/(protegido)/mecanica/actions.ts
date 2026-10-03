"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoSolicitudMecanica } from "@/types/database";
import { ESTADOS_SOLICITUD_MECANICA } from "./estado-utils";

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

/**
 * Acepta/rechaza/completa la solicitud. Siempre es una acción manual de la
 * dueña o un empleado: no hay ningún camino en el código que mueva una
 * solicitud fuera de 'pendiente' sin que alguien del staff lo apruete acá.
 */
export async function actualizarEstadoSolicitudMecanicaAction(solicitudId: string, formData: FormData) {
  const { supabase, userId } = await requireStaff();

  const nuevoEstado = String(formData.get("estado") || "") as EstadoSolicitudMecanica;
  if (!ESTADOS_SOLICITUD_MECANICA.includes(nuevoEstado)) throw new Error("Estado inválido.");

  const { data: actual } = await supabase
    .from("solicitudes_mecanica")
    .select("estado")
    .eq("id", solicitudId)
    .single();
  if (!actual) throw new Error("Solicitud no encontrada.");

  if (actual.estado === nuevoEstado) return;

  const { error } = await supabase
    .from("solicitudes_mecanica")
    .update({ estado: nuevoEstado })
    .eq("id", solicitudId);
  if (error) throw new Error(error.message);

  await supabase.from("historial_cambios").insert({
    tabla: "solicitudes_mecanica",
    registro_id: solicitudId,
    usuario_id: userId,
    accion: "cambio_estado",
    campo: "estado",
    valor_anterior: actual.estado,
    valor_nuevo: nuevoEstado,
  });

  revalidatePath("/admin/mecanica");
  revalidatePath(`/admin/mecanica/${solicitudId}`);
}

export async function guardarNotaSolicitudMecanicaAction(solicitudId: string, formData: FormData) {
  const { supabase } = await requireStaff();
  const notasInternas = String(formData.get("notasInternas") || "").trim() || null;

  const { error } = await supabase
    .from("solicitudes_mecanica")
    .update({ notas_internas: notasInternas })
    .eq("id", solicitudId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/mecanica/${solicitudId}`);
}
