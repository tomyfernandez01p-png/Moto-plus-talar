import type { Metadata } from "next";
import { buscarProductos, type FiltrosProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";

export const metadata: Metadata = { title: "Resultados de búsqueda" };

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = searchParams.q ?? "";
  const filtros: FiltrosProductos = {
    q,
    pagina: searchParams.pagina ? Number(searchParams.pagina) : 1,
  };
  const { productos, total, pagina, porPagina } = q
    ? await buscarProductos(filtros)
    : { productos: [], total: 0, pagina: 1, porPagina: 24 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white">
        Resultados para &ldquo;{q}&rdquo;
      </h1>
      <p className="mb-6 text-sm text-base-muted">{total} productos encontrados</p>
      <ProductGrid productos={productos} />
      <Pagination
        pagina={pagina}
        total={total}
        porPagina={porPagina}
        basePath="/buscar"
        searchParams={searchParams}
      />
    </div>
  );
}
