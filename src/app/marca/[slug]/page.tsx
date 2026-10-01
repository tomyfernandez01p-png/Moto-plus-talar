import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buscarProductos, type FiltrosProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Pagination } from "@/components/product/Pagination";
import { OrdenSelect } from "@/components/product/OrdenSelect";

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

async function getMarca(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("marcas")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const marca = await getMarca(params.slug);
  if (!marca) return {};
  return { title: marca.nombre, description: marca.descripcion || undefined };
}

export default async function MarcaPage({ params, searchParams }: Props) {
  const marca = await getMarca(params.slug);
  if (!marca) notFound();

  const filtros: FiltrosProductos = {
    marcaSlug: params.slug,
    orden: (searchParams.orden as FiltrosProductos["orden"]) ?? "relevancia",
    pagina: searchParams.pagina ? Number(searchParams.pagina) : 1,
  };
  const { productos, total, pagina, porPagina } = await buscarProductos(filtros);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-white">{marca.nombre}</h1>
          {marca.descripcion && <p className="text-sm text-base-muted">{marca.descripcion}</p>}
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
        basePath={`/marca/${params.slug}`}
        searchParams={searchParams}
      />
    </div>
  );
}
