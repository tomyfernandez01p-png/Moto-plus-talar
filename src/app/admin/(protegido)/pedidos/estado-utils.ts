import type { EstadoPedido } from "@/types/database";

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  "nuevo",
  "pago_pendiente",
  "pago_aprobado",
  "confirmado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  nuevo: "Sin pagar",
  pago_pendiente: "Pago pendiente",
  pago_aprobado: "Pago aprobado",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

/** Pedidos que todavía no tienen el pago confirmado: no se muestran como recibidos. */
export const ESTADOS_SIN_PAGO: EstadoPedido[] = ["nuevo", "pago_pendiente"];

export const ESTADO_TONO: Record<EstadoPedido, "orange" | "neutral" | "success" | "danger"> = {
  nuevo: "orange",
  pago_pendiente: "orange",
  pago_aprobado: "success",
  confirmado: "success",
  preparando: "neutral",
  enviado: "neutral",
  entregado: "success",
  cancelado: "danger",
};
