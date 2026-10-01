import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buscarProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BuscadorMoto } from "@/components/home/BuscadorMoto";

export const metadata: Metadata = { title: "¿Qué moto tenés?" };

export default async function MiMotoPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  const { data: motos } = await supabase.from("motos").select("*").eq("activo", true);

  const { marca_moto, modelo_moto, anio } = searchParams;
  const hayBusqueda = !!marca_moto;

  const { productos, total } = hayBusqueda
    ? await buscarProductos({
        marcaMoto: marca_moto,
        modeloMoto: modelo_moto,
        anioMoto: anio ? Number(anio) : undefined,
      })
    : { productos: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white">¿Qué moto tenés?</h1>
      <p className="mb-6 text-sm text-base-muted">
        Elegí marca, modelo y año para ver los repuestos y accesorios compatibles.
      </p>

      <BuscadorMoto motos={motos ?? []} />

      {hayBusqueda && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-base-muted">
            {total} productos compatibles con {marca_moto} {modelo_moto} {anio}
          </p>
          <ProductGrid productos={productos} />
        </div>
      )}

      {(motos ?? []).length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-base-border p-8 text-center text-sm text-base-muted">
          Todavía no hay motos cargadas en el catálogo de compatibilidad. Pronto vamos a sumar más modelos.
        </div>
      )}
    </div>
  );
}
