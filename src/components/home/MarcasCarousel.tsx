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
      <SectionHeader titulo="Marcas destacadas" verTodoHref="/marcas" />
      <div className="fade-edge-x no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scroll-snap-type:x_mandatory] md:mx-0 md:grid md:grid-cols-8 md:overflow-visible md:px-0">
        {marcas.map((m) => (
          <Link
            key={m.slug}
            href={`/marca/${m.slug}`}
            // fondo claro a propósito: los logos de marca vienen en su color
            // real (no todos quedan bien recortados en negro), así que una
            // tarjeta clara los muestra tal cual son en vez de aplicarles un
            // filtro gris que los deslava.
            className="group flex h-20 w-28 shrink-0 items-center justify-center rounded-xl border border-transparent bg-neutral-100 p-3 shadow-sm transition-all duration-200 ease-smooth [scroll-snap-align:start] hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-card-hover md:w-auto"
          >
            {m.logo_url ? (
              <div className="relative h-full w-full transition-transform duration-200 ease-smooth group-hover:scale-110">
                <Image
                  src={m.logo_url}
                  alt={m.nombre}
                  fill
                  unoptimized={isDataUrl(m.logo_url)}
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-neutral-800">{m.nombre}</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
