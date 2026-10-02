"use client";

const STORAGE_KEY = "mpt_favoritos_session";

/**
 * Id de "sesión de invitado" para favoritos, generado una sola vez en el
 * browser y persistido en localStorage -- mismo patrón que `cart-context`
 * usa para el carrito (`mpt_carrito_v1`). Es la credencial de alta entropía
 * que la policy RLS `favoritos_propio` espera recibir en el header
 * `x-favoritos-session` (ver migración
 * 20261001152000_fix_favoritos_rls_anonimos.sql) para poder aislar los
 * favoritos de cada visitante sin cuenta. No es adivinable ni correlativo:
 * `crypto.randomUUID()`.
 */
export function getFavoritosSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage no disponible (modo privado, etc.): sin id persistente,
    // favoritos de invitado no funciona en esta sesión, pero el resto del
    // sitio sigue andando normalmente.
    return null;
  }
}
