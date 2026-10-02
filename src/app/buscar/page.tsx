import type { Metadata } from "next";
import { buscarProductos, type FiltrosProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";
import { SearchBar } from "@/components/layout/SearchBar";
import { IconSearch } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Buscar" };

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

  if (!q) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center md:px-6">
        <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
          <IconSearch className="h-8 w-8" />
        </span>
        <h1 className="mb-2 text-2xl font-bold text-base-white">¿Qué estás buscando?</h1>
        <p className="mb-6 text-sm text-base-muted">
          Buscá por nombre, código, marca o categoría.
        </p>
        <SearchBar className="w-full" autoFocus />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6">
        <SearchBar className="mb-5 max-w-xl" defaultValue={q} />
        <h1 className="text-xl font-bold text-base-white">
          Resultados para &ldquo;{q}&rdquo;
        </h1>
        <p className="text-sm text-base-muted">{total} productos encontrados</p>
      </div>
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
