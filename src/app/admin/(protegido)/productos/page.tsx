import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/Button";
import { ProductosTable } from "./ProductosTable";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; stock?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("productos")
    .select("id, nombre, sku, codigo, precio, stock, estado_stock, activo, destacado, imagen_principal_url")
    .order("fecha_alta", { ascending: false })
    .limit(100);

  if (searchParams.q) {
    query = query.or(`nombre.ilike.%${searchParams.q}%,codigo.ilike.%${searchParams.q}%,sku.ilike.%${searchParams.q}%`);
  }
  if (searchParams.stock === "bajo") query = query.eq("estado_stock", "ultimas_unidades");
  if (searchParams.stock === "sin_stock") query = query.eq("estado_stock", "sin_stock");

  const [{ data: productos }, { data: categorias }, { data: marcas }] = await Promise.all([
    query,
    supabase.from("categorias").select("id, nombre").order("nombre"),
    supabase.from("marcas").select("id, nombre").order("nombre"),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-base-white">Productos</h1>
        <div className="flex gap-2">
          <ButtonLink href="/admin/productos/importar-catalogo" variant="secondary" size="sm">
            Importar fotos y logos
          </ButtonLink>
          <ButtonLink href="/admin/productos/nuevo" size="sm">
            + Nuevo producto
          </ButtonLink>
        </div>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nombre, código o SKU…"
          className="w-full max-w-md rounded-lg border border-base-border bg-base-surface px-3 py-2.5 text-sm text-base-white"
        />
      </form>

      <ProductosTable productos={productos ?? []} categorias={categorias ?? []} marcas={marcas ?? []} />
    </div>
  );
}
