import type { Metadata } from "next";
import { Suspense } from "react";
import { buscarProductos, type FiltrosProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";
import { OrdenSelect } from "@/components/product/OrdenSelect";

export const metadata: Metadata = {
  title: "Tienda",
  description: "Todos los repuestos y accesorios para motos disponibles.",
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filtros: FiltrosProductos = {
    destacado: searchParams.destacado === "1",
    oferta: searchParams.oferta === "1",
    nuevo: searchParams.nuevo === "1",
    orden: (searchParams.orden as FiltrosProductos["orden"]) ?? "relevancia",
    pagina: searchParams.pagina ? Number(searchParams.pagina) : 1,
  };

  const { productos, total, pagina, porPagina } = await buscarProductos(filtros);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-white">Tienda</h1>
          <p className="text-sm text-base-muted">{total} productos</p>
        </div>
        <Suspense fallback={null}>
          <OrdenSelect />
        </Suspense>
      </div>
      <ProductGrid productos={productos} />
      <Pagination
        pagina={pagina}
        total={total}
        porPagina={porPagina}
        basePath="/productos"
        searchParams={searchParams}
      />
    </div>
  );
}
