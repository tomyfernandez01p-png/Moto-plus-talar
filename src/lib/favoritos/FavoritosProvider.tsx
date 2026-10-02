"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createFavoritosClient } from "@/lib/supabase/favoritos-client";
import { getFavoritosSessionId } from "@/lib/favoritos/session";

interface FavoritosContextValue {
  favoritos: Set<string>;
  cargando: boolean;
  esFavorito: (productoId: string) => boolean;
  toggleFavorito: (productoId: string) => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

/**
 * Activa la funcionalidad de favoritos que ya existía preparada en la base
 * (tabla `favoritos` + policy RLS `favoritos_propio`, ver migración
 * 20261001152000) pero sin ninguna pantalla. Un solo fetch por carga de
 * página (no uno por `ProductCard`), compartido vía contexto -- mismo
 * patrón que `CartProvider`. No reemplaza ni toca el carrito.
 */
export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const usuarioIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const supabase = createFavoritosClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        usuarioIdRef.current = user?.id ?? null;

        // RLS ya limita el resultado a las filas propias (del usuario
        // logueado o de esta sesión de invitado): no hace falta filtrar acá.
        const { data, error } = await supabase.from("favoritos").select("producto_id");
        if (error) throw error;
        if (!cancelado) setFavoritos(new Set((data ?? []).map((f) => f.producto_id)));
      } catch {
        // Si falla (red, RLS, lo que sea) los favoritos simplemente no se
        // muestran marcados -- nunca debe romper la navegación del sitio.
        if (!cancelado) setFavoritos(new Set());
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const toggleFavorito = useCallback(async (productoId: string) => {
    const supabase = createFavoritosClient();
    const yaEsFavorito = favoritos.has(productoId);

    // Actualización optimista: el corazón responde al toque al instante: el
    // microinteracción (brief #14) se siente real aunque la red tarde.
    setFavoritos((prev) => {
      const next = new Set(prev);
      if (yaEsFavorito) next.delete(productoId);
      else next.add(productoId);
      return next;
    });

    try {
      if (yaEsFavorito) {
        const { error } = await supabase.from("favoritos").delete().eq("producto_id", productoId);
        if (error) throw error;
      } else {
        const usuarioId = usuarioIdRef.current;
        const sessionId = getFavoritosSessionId();
        const fila = usuarioId
          ? { producto_id: productoId, usuario_id: usuarioId }
          : { producto_id: productoId, session_id: sessionId };
        const { error } = await supabase.from("favoritos").insert(fila);
        if (error) throw error;
      }
    } catch {
      // Revertir el optimismo si la escritura real falló (red, RLS, etc.)
      setFavoritos((prev) => {
        const next = new Set(prev);
        if (yaEsFavorito) next.add(productoId);
        else next.delete(productoId);
        return next;
      });
    }
  }, [favoritos]);

  const esFavorito = useCallback((productoId: string) => favoritos.has(productoId), [favoritos]);

  const value = useMemo(
    () => ({ favoritos, cargando, esFavorito, toggleFavorito }),
    [favoritos, cargando, esFavorito, toggleFavorito]
  );

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

export function useFavoritos() {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error("useFavoritos debe usarse dentro de <FavoritosProvider>");
  return ctx;
}
