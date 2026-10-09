import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn, isDataUrl, logoChipClass } from "@/lib/utils";

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
        // Pedido del usuario: solo logo + nombre, sin tarjeta/fondo
        // alrededor (antes tenía una tarjeta clara bg-neutral-100), igual
        // que la tira de marcas de la Home.
        <div className="grid grid-cols-3 gap-y-6 pt-4 sm:grid-cols-4 md:grid-cols-6">
          {marcas.map((m) => (
            <Link
              key={m.slug}
              href={`/marca/${m.slug}`}
              className="group flex h-24 flex-col items-center justify-center gap-2 transition-transform duration-200 ease-smooth hover:-translate-y-0.5"
            >
              {m.logo_url ? (
                <>
                  <div className={cn("relative h-12 w-full transition-transform duration-200 ease-smooth group-hover:scale-110", logoChipClass(m.logo_url))}>
                    <Image
                      src={m.logo_url}
                      alt=""
                      fill
                      unoptimized={isDataUrl(m.logo_url)}
                      className="object-contain"
                    />
                  </div>
                  <span className="max-w-[120px] truncate text-center text-xs font-semibold text-base-muted transition-colors duration-200 group-hover:text-base-white">
                    {m.nombre}
                  </span>
                </>
              ) : (
                // Sin logo oficial cargado: nombre de la marca como wordmark
                // limpio, sin iniciales inventadas.
                <span className="max-w-[130px] truncate text-center text-sm font-extrabold uppercase tracking-wider text-base-white/80 transition-colors duration-200 group-hover:text-brand-orange">
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
