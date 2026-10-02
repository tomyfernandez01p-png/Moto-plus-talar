"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useFavoritos } from "@/lib/favoritos/FavoritosProvider";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { ButtonLink } from "@/components/ui/Button";
import { IconHeart } from "@/components/ui/Icons";
import type { Database } from "@/types/database";

type VistaProducto = Database["public"]["Views"]["vista_productos"]["Row"];

export function FavoritosClient() {
  const { favoritos, cargando: cargandoFavoritos } = useFavoritos();
  const [productos, setProductos] = useState<VistaProducto[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);

  useEffect(() => {
    if (cargandoFavoritos) return;
    const ids = Array.from(favoritos);
    if (ids.length === 0) {
      setProductos([]);
      setCargandoProductos(false);
      return;
    }
    let cancelado = false;
    setCargandoProductos(true);
    const supabase = createClient();
    supabase
      .from("vista_productos")
      .select("*")
      .in("id", ids)
      .eq("activo", true)
      .then(({ data }) => {
        if (!cancelado) setProductos(data ?? []);
      })
      .then(() => {
        if (!cancelado) setCargandoProductos(false);
      });
    return () => {
      cancelado = true;
    };
    // `favoritos` es un Set nuevo en cada cambio (ver FavoritosProvider), así
    // que compararlo por tamaño/contenido via su propia referencia alcanza.
  }, [favoritos, cargandoFavoritos]);

  if (cargandoFavoritos || cargandoProductos) {
    return <ProductGridSkeleton />;
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          <IconHeart className="h-8 w-8" />
        </span>
        <h2 className="mb-2 text-lg font-bold text-base-white">Todavía no tenés favoritos</h2>
        <p className="mb-6 max-w-sm text-sm text-base-muted">
          Tocá el corazón en cualquier producto para guardarlo acá y encontrarlo rápido después.
        </p>
        <ButtonLink href="/productos">Ver productos</ButtonLink>
      </div>
    );
  }

  return <ProductGrid productos={productos} />;
}
