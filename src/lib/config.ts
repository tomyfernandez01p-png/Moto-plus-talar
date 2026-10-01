import type { Database } from "@/types/database";

/**
 * Tipo y helpers agnósticos de entorno: NO deben importar nada server-only
 * (ni `@/lib/supabase/server`, ni `next/headers`, ni `react`'s `cache`).
 * Este módulo se importa tanto desde Server Components como desde Client
 * Components (ej. WhatsAppFloat), así que cualquier import server-only acá
 * rompe el build con "you're importing a component that needs
 * react-server-components" en cuanto un Client Component lo toca.
 *
 * La función que sí pega contra la base (`getConfiguracion`) vive en
 * `@/lib/config.server` — solo para Server Components, Server Actions o
 * Route Handlers.
 */
export type Configuracion = Database["public"]["Tables"]["configuracion"]["Row"];

export function whatsappLink(config: Configuracion, mensaje: string) {
  const base = config.whatsapp_link || "https://wa.me/1122978803";
  return `${base}?text=${encodeURIComponent(mensaje)}`;
}

export function mapsComoLlegarUrl(config: Configuracion) {
  const direccionCompleta = [config.direccion, config.ciudad, config.provincia, "Argentina"]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`;
}
