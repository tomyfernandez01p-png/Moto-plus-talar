"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getFavoritosSessionId } from "@/lib/favoritos/session";

/**
 * Cliente de Supabase para Client Components, igual al de
 * `@/lib/supabase/client` pero mandando el header `x-favoritos-session` en
 * cada request. Mandarlo siempre (haya o no usuario logueado) es inofensivo:
 * la policy `favoritos_propio` solo lo usa en la rama
 * `usuario_id is null and session_id = ...`, así que para un usuario
 * logueado el header simplemente no se usa. Se separa del cliente genérico
 * para no tocar ningún otro `.from(...)` existente en el sitio.
 */
export function createFavoritosClient() {
  const sessionId = getFavoritosSessionId();
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    sessionId
      ? { global: { headers: { "x-favoritos-session": sessionId } } }
      : undefined
  );
}
