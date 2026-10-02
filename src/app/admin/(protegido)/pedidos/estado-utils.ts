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
  nuevo: "Nuevo",
  pago_pendiente: "Pago pendiente",
  pago_aprobado: "Pago aprobado",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

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
