import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductoForm } from "../ProductoForm";
import { eliminarProductoAction } from "../actions";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: producto }, { data: categorias }, { data: marcas }, { data: compatibilidad }] =
    await Promise.all([
      supabase.from("productos").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("categorias").select("id, nombre").order("nombre"),
      supabase.from("marcas").select("id, nombre").order("nombre"),
      supabase.from("producto_compatibilidad").select("*").eq("producto_id", params.id),
    ]);

  if (!producto) notFound();

  async function eliminar() {
    "use server";
    await eliminarProductoAction(params.id);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-base-white">Editar producto</h1>
        <form action={eliminar}>
          <button className="text-sm text-red-400 hover:underline">Eliminar producto</button>
        </form>
      </div>
      <ProductoForm
        producto={producto}
        categorias={categorias ?? []}
        marcas={marcas ?? []}
        compatibilidad={compatibilidad ?? []}
      />
    </div>
  );
}
