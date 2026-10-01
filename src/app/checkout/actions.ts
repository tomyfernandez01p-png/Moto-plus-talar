"use server";

import { createClient } from "@/lib/supabase/server";
import type { MetodoPago, TipoEntrega } from "@/types/database";

export interface ItemCheckout {
  producto_id: string;
  cantidad: number;
}

export interface DatosCheckout {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dniCuit?: string;
  tipoEntrega: TipoEntrega;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  /**
   * Solo informativo: la RPC `crear_pedido` lo ignora por completo y
   * recalcula el costo de envío server-side desde
   * `configuracion.metodos_envio` + el subtotal real (ver
   * 0010_crear_pedido_costo_envio_servidor.sql). No usar este valor para
   * nada que dependa de seguridad/monto final.
   */
  costoEnvio: number;
  metodoPago?: MetodoPago;
  items: ItemCheckout[];
}

export async function crearPedidoAction(datos: DatosCheckout) {
  if (datos.items.length === 0) {
    return { ok: false as const, error: "El carrito está vacío." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const direccionEnvio =
    datos.tipoEntrega === "envio"
      ? {
          direccion: datos.direccion,
          ciudad: datos.ciudad,
          provincia: datos.provincia,
          codigo_postal: datos.codigoPostal,
        }
      : null;

  const { data, error } = await supabase.rpc("crear_pedido", {
    p_usuario_id: user?.id ?? null,
    p_nombre: datos.nombre,
    p_apellido: datos.apellido,
    p_email: datos.email,
    p_telefono: datos.telefono,
    p_dni_cuit: datos.dniCuit ?? null,
    p_tipo_entrega: datos.tipoEntrega,
    p_direccion_envio: direccionEnvio,
    p_costo_envio: datos.costoEnvio,
    p_items: datos.items,
    p_metodo_pago: datos.metodoPago ?? null,
  });

  if (error) {
    // Nunca se filtra el error crudo de Postgres al cliente: se muestra un
    // mensaje genérico y el detalle queda en los logs del servidor.
    console.error("crear_pedido", error);
    const mensaje = error.message?.includes("Sin stock")
      ? "Uno de los productos ya no tiene stock suficiente. Revisá tu carrito."
      : "No pudimos generar tu pedido. Intentá de nuevo o escribinos por WhatsApp.";
    return { ok: false as const, error: mensaje };
  }

  return { ok: true as const, pedidoId: data as string };
}
