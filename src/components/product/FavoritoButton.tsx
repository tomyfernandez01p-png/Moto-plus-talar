"use client";

import { useState } from "react";
import { IconHeart } from "@/components/ui/Icons";
import { useFavoritos } from "@/lib/favoritos/FavoritosProvider";
import { cn } from "@/lib/utils";

/**
 * Botón de corazón (brief #14): ♡ no seleccionado / ♥ seleccionado, con
 * microanimación al tocar. Usa la tabla + RLS de favoritos que ya existían
 * en la base, para usuarios logueados y para invitados (vía sesión
 * anónima persistida). No condiciona su visibilidad a tener cuenta activa.
 */
export function FavoritoButton({
  productoId,
  size = "md",
  className,
}: {
  productoId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const { esFavorito, toggleFavorito } = useFavoritos();
  const activo = esFavorito(productoId);
  const [animar, setAnimar] = useState(false);

  const dimensiones = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconoDim = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={activo}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnimar(true);
        toggleFavorito(productoId);
        setTimeout(() => setAnimar(false), 400);
      }}
      className={cn(
        "focus-ring flex shrink-0 items-center justify-center rounded-full border backdrop-blur transition-colors duration-200",
        activo
          ? "border-brand-orange/40 bg-brand-orange/15 text-brand-orange"
          : "border-base-border/80 bg-base-black/40 text-base-white hover:text-brand-orange",
        dimensiones,
        className
      )}
    >
      <IconHeart filled={activo} className={cn(iconoDim, animar && "animate-heart-pop")} />
    </button>
  );
}
