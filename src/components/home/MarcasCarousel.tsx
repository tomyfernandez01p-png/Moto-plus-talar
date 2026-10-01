import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";

interface Marca {
  nombre: string;
  slug: string;
  logo_url: string | null;
}

export function MarcasCarousel({ marcas }: { marcas: Marca[] }) {
  if (marcas.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <SectionHeader titulo="Marcas destacadas" verTodoHref="/productos" />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-8 md:overflow-visible md:px-0">
        {marcas.map((m) => (
          <Link
            key={m.slug}
            href={`/marca/${m.slug}`}
            className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-base-border bg-base-surface p-3 grayscale transition-all duration-200 ease-smooth hover:grayscale-0 hover:border-brand-orange/50 md:w-auto"
          >
            {m.logo_url ? (
              <div className="relative h-full w-full">
                <Image
                  src={m.logo_url}
                  alt={m.nombre}
                  fill
                  unoptimized={isDataUrl(m.logo_url)}
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-base-white">{m.nombre}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
