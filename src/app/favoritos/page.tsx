import type { Metadata } from "next";
import { FavoritosClient } from "./FavoritosClient";

export const metadata: Metadata = { title: "Favoritos" };

/**
 * Página nueva: activa de cara al usuario la tabla `favoritos` + policy RLS
 * que ya existían en la base (ver FavoritosProvider). Funciona tanto
 * logueado como de invitado (sesión anónima persistida), sin exponer nada
 * del admin.
 */
export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-1 text-2xl font-bold text-base-white">Tus favoritos</h1>
      <p className="mb-6 text-sm text-base-muted">Los productos que marcaste con el corazón.</p>
      <FavoritosClient />
    </div>
  );
}
