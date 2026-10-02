import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoriasGrid } from "@/components/home/CategoriasGrid";

export const metadata: Metadata = { title: "Categorías" };

/**
 * Página nueva (no existía): el header, el menú mobile y la barra inferior
 * mobile necesitan un destino real para "Categorías → ver todas" / tab
 * "Categorías" (brief #4/#20/#21). Reutiliza la misma consulta y el mismo
 * componente visual que ya usa la Home -- ningún dato ni lógica nueva.
 */
export default async function CategoriasPage() {
  const supabase = createClient();
  const { data: categorias } = await supabase
    .from("categorias")
    .select("nombre, slug, imagen_url")
    .is("categoria_padre_id", null)
    .eq("activo", true)
    .order("orden");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-1 text-2xl font-bold text-base-white">Categorías</h1>
      <p className="mb-2 text-sm text-base-muted">
        Todo lo que tu moto necesita, organizado por categoría.
      </p>
      <CategoriasGrid categorias={categorias ?? []} />
    </div>
  );
}
