"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { IconChevronRight } from "@/components/ui/Icons";

export interface BannerCarouselItem {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  imagen_url: string;
  boton_texto: string | null;
  boton_url: string | null;
}

const INTERVALO_MS = 5000;

/**
 * Carrusel de "publicidad" al tope de la Home (pedido del usuario, con un
 * boceto propio de referencia: cuadro con fotos que se van pasando solas a
 * una velocidad que se alcance a leer). Usa los banners reales que ya se
 * cargaban desde /admin/banners -- esa pantalla existía hace rato pero
 * nunca se mostraba en ningún lado del sitio público. Ninguna imagen ni
 * texto se inventa acá: si todavía no hay banners activos cargados, el
 * componente no renderiza nada (ver page.tsx).
 */
export function BannerCarousel({ banners }: { banners: BannerCarouselItem[] }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = banners.length;

  const siguiente = useCallback(() => setIndice((i) => (i + 1) % total), [total]);
  const anterior = useCallback(() => setIndice((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(siguiente, INTERVALO_MS);
    return () => clearInterval(id);
  }, [total, pausado, siguiente]);

  if (total === 0) return null;

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta > 0 ? anterior : siguiente)();
    touchStartX.current = null;
  }

  return (
    <section
      aria-label="Ofertas y novedades"
      aria-roledescription="carrusel"
      className="relative mx-auto overflow-hidden bg-base-black sm:mx-4 sm:mt-4 sm:max-w-7xl sm:rounded-3xl sm:border sm:border-base-border md:mx-6"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-smooth"
        style={{ transform: `translateX(-${indice * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            aria-hidden={i !== indice}
            className="relative aspect-[4/3] w-full shrink-0 sm:aspect-[21/9]"
          >
            <Image
              src={banner.imagen_url}
              alt={banner.titulo ?? ""}
              fill
              unoptimized={isDataUrl(banner.imagen_url)}
              priority={i === 0}
              className="object-cover"
            />
            {(banner.titulo || banner.descripcion || (banner.boton_texto && banner.boton_url)) && (
              <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 bg-gradient-to-t from-base-black/90 via-base-black/25 to-transparent p-5 sm:p-10">
                {banner.titulo && (
                  <h2 className="max-w-lg text-xl font-extrabold leading-tight text-base-white sm:text-3xl">
                    {banner.titulo}
                  </h2>
                )}
                {banner.descripcion && (
                  <p className="max-w-md text-sm text-base-muted sm:text-base">{banner.descripcion}</p>
                )}
                {banner.boton_texto && banner.boton_url && (
                  <Link
                    href={banner.boton_url}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105"
                  >
                    {banner.boton_texto}
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Banner anterior"
            className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base-black/60 text-base-white backdrop-blur transition-colors hover:bg-base-black/80 sm:flex"
          >
            <IconChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Banner siguiente"
            className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base-black/60 text-base-white backdrop-blur transition-colors hover:bg-base-black/80 sm:flex"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === indice}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === indice ? "w-6 bg-brand-orange" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
