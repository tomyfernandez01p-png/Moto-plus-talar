import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "../ProductoForm";

export default async function NuevoProductoPage() {
  const supabase = createClient();
  const [{ data: categorias }, { data: marcas }] = await Promise.all([
    supabase.from("categorias").select("id, nombre").order("nombre"),
    supabase.from("marcas").select("id, nombre").order("nombre"),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Nuevo producto</h1>
      <ProductoForm categorias={categorias ?? []} marcas={marcas ?? []} />
    </div>
  );
}
