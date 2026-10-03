import type { EstadoSolicitudMecanica } from "@/types/database";

export const ESTADOS_SOLICITUD_MECANICA: EstadoSolicitudMecanica[] = [
  "pendiente",
  "aceptada",
  "rechazada",
  "completada",
];

export const ESTADO_SOLICITUD_LABEL: Record<EstadoSolicitudMecanica, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  completada: "Completada",
};

export const ESTADO_SOLICITUD_TONO: Record<EstadoSolicitudMecanica, "orange" | "neutral" | "success" | "danger"> = {
  pendiente: "orange",
  aceptada: "success",
  rechazada: "danger",
  completada: "neutral",
};
