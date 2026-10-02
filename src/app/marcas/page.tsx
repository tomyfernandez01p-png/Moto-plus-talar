import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isDataUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Marcas" };

/**
 * Página nueva (no existía): hasta ahora solo había /marca/[slug] (el
 * catálogo de una marca puntual). El header y el menú mobile necesitan un
 * "Marcas →" que lleve a algún lado real -- esta página lista las marcas
 * activas reales (misma tabla que ya usa el Footer/Home), cada una
 * enlazando a su página real de productos.
 */
export default async function MarcasPage() {
  const supabase = createClient();
  const { data: marcas } = await supabase
    .from("marcas")
    .select("nombre, slug, logo_url")
    .eq("activo", true)
    .order("orden");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-1 text-2xl font-bold text-base-white">Marcas</h1>
      <p className="mb-2 text-sm text-base-muted">Las marcas con las que trabajamos.</p>
      {marcas && marcas.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-3 md:grid-cols-5">
          {marcas.map((m) => (
            <Link
              key={m.slug}
              href={`/marca/${m.slug}`}
              className="group relative flex h-24 items-center justify-center rounded-2xl border border-base-border bg-base-surface p-4 grayscale transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand-orange/50 hover:grayscale-0 hover:shadow-card-hover"
            >
              {m.logo_url ? (
                <Image
                  src={m.logo_url}
                  alt={m.nombre}
                  fill
                  unoptimized={isDataUrl(m.logo_url)}
                  className="object-contain p-2"
                />
              ) : (
                <span className="text-center text-sm font-bold text-base-white group-hover:text-brand-orange">
                  {m.nombre}
                </span>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-base-muted">Todavía no hay marcas cargadas.</p>
      )}
    </div>
  );
}
