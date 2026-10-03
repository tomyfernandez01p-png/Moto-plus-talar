"use server";

import { createClient } from "@/lib/supabase/server";

export interface DatosSolicitudMecanica {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  motoMarca?: string;
  motoModelo?: string;
  serviciosIds: string[];
  descripcionProblema?: string;
  repuestoCliente?: string;
  disclaimerAceptado: boolean;
}

/**
 * Crea la solicitud de turno de mecánica vía RPC (misma razón que
 * `crear_pedido`): un insert directo con `.select().single()` encadenado
 * se topa con que Postgres también filtra el `RETURNING` de un INSERT con
 * la política de SELECT, y acá a propósito NO hay política de SELECT
 * pública (un cliente no puede leer solicitudes ajenas con teléfono/
 * problema de otra persona) — con insert directo el pedido se hubiera
 * guardado bien, pero sin poder devolverle el número al cliente. La RPC
 * `crear_solicitud_mecanica` (security definer) evita ese problema y de
 * paso vuelve a validar server-side el disclaimer y que haya al menos un
 * servicio elegido, por si alguien se saltea el formulario.
 */
export async function crearSolicitudMecanicaAction(datos: DatosSolicitudMecanica) {
  if (!datos.disclaimerAceptado) {
    return {
      ok: false as const,
      error: "Tenés que aceptar la confirmación de repuesto/condiciones para poder enviar el pedido de turno.",
    };
  }
  if (datos.serviciosIds.length === 0) {
    return { ok: false as const, error: "Elegí al menos un servicio." };
  }
  if (!datos.nombre.trim() || !datos.apellido.trim() || !datos.telefono.trim()) {
    return { ok: false as const, error: "Completá nombre, apellido y teléfono." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("crear_solicitud_mecanica", {
    p_usuario_id: user?.id ?? null,
    p_nombre: datos.nombre.trim(),
    p_apellido: datos.apellido.trim(),
    p_telefono: datos.telefono.trim(),
    p_email: datos.email?.trim() || null,
    p_moto_marca: datos.motoMarca?.trim() || null,
    p_moto_modelo: datos.motoModelo?.trim() || null,
    p_servicios_ids: datos.serviciosIds,
    p_descripcion_problema: datos.descripcionProblema?.trim() || null,
    p_repuesto_cliente: datos.repuestoCliente?.trim() || null,
    p_disclaimer_aceptado: true,
  });

  if (error) {
    console.error("crear_solicitud_mecanica", error);
    return {
      ok: false as const,
      error: "No pudimos enviar tu pedido de turno. Intentá de nuevo o escribinos por WhatsApp.",
    };
  }

  const resultado = data as { id: string; numero: number };
  return { ok: true as const, solicitudId: resultado.id, numero: resultado.numero };
}
