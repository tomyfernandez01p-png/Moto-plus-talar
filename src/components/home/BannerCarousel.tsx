"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isDataUrl } from "@/lib/utils";
import { IconChevronRight, IconTag, IconWrench, IconTruck, IconGrid } from "@/components/ui/Icons";

const ICONOS = { oferta: IconTag, turno: IconWrench, envio: IconTruck, equipar: IconGrid } as const;

export interface BannerCarouselItem {
  id: string;
  titulo: string | null;
  descripcion: string | null;
  /**
   * null = todavía no hay foto real cargada para este slide (banner de
   * respaldo armado en page.tsx a partir de datos reales del sitio, nunca
   * una promoción inventada). Se resuelve con el mismo lenguaje visual que
   * ya usa el Hero/las categorías sin foto: gradiente + ícono propio, no
   * una imagen de stock.
   */
  imagen_url: string | null;
  icono?: keyof typeof ICONOS;
  boton_texto: string | null;
  boton_url: string | null;
}

const INTERVALO_MS = 5000;

/**
 * Carrusel de "publicidad" al tope de la Home -- reemplaza al Hero anterior
 * como primera sección real de la página (pedido explícito del usuario: no
 * quiere que arranque con el título/subtítulo de texto, quiere que arranque
 * con esto). Usa los banners reales de /admin/banners si hay cargados; si
 * no hay ninguno todavía, page.tsx arma slides de respaldo 100% a partir de
 * datos reales del sitio (ofertas con descuento real, la función de
 * mecánica, el envío configurado) -- nunca un número o una promo inventada.
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
      aria-label="Ofertas y publicidad"
      aria-roledescription="carrusel"
      className="group/carousel relative mx-auto overflow-hidden bg-base-black sm:mx-4 sm:mt-4 sm:max-w-7xl sm:rounded-3xl sm:border sm:border-base-border md:mx-6"
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
        {banners.map((banner, i) => {
          const Icono = banner.icono ? ICONOS[banner.icono] : null;
          return (
            <div
              key={banner.id}
              aria-hidden={i !== indice}
              className="relative aspect-[4/5] max-h-[80vh] w-full shrink-0 sm:aspect-[21/9]"
            >
              {banner.imagen_url ? (
                <Image
                  src={banner.imagen_url}
                  alt={banner.titulo ?? ""}
                  fill
                  unoptimized={isDataUrl(banner.imagen_url)}
                  priority={i === 0}
                  className="object-cover"
                />
              ) : (
                // Sin foto real todavía: mismo lenguaje visual que el Hero
                // (gradiente de marca + ícono propio), nunca una imagen de
                // stock genérica.
                <div
                  aria-hidden
                  className="bg-grain absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,106,0,0.28),transparent_60%)]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#17120c_0%,#151517_55%,#0a0a0b_100%)]" />
                  {Icono && (
                    <span
                      aria-hidden
                      className="absolute right-[6%] top-1/2 flex h-28 w-28 -translate-y-1/2 items-center justify-center rounded-full border border-brand-orange/25 bg-brand-orange/10 text-brand-orange/70 sm:h-36 sm:w-36"
                    >
                      <Icono className="h-12 w-12 sm:h-16 sm:w-16" />
                    </span>
                  )}
                </div>
              )}
              {(banner.titulo || banner.descripcion || (banner.boton_texto && banner.boton_url)) && (
                <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-gradient-to-t from-base-black/95 via-base-black/35 to-transparent p-6 sm:p-10 md:p-14">
                  {banner.titulo && (
                    <h2 className="max-w-lg text-2xl font-extrabold leading-tight tracking-tight text-base-white sm:text-4xl md:text-5xl">
                      {banner.titulo}
                    </h2>
                  )}
                  {banner.descripcion && (
                    <p className="max-w-md text-sm text-base-muted sm:text-lg">{banner.descripcion}</p>
                  )}
                  {banner.boton_texto && banner.boton_url && (
                    <Link
                      href={banner.boton_url}
                      className="group mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-5 py-3 text-sm font-bold text-white shadow-glow-sm transition-transform duration-200 hover:scale-105 sm:px-6 sm:py-3.5 sm:text-base"
                    >
                      {banner.boton_texto}
                      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={anterior}
            aria-label="Banner anterior"
            className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-base-black/50 text-base-white backdrop-blur transition-opacity duration-200 hover:bg-base-black/80 sm:flex sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            <IconChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={siguiente}
            aria-label="Banner siguiente"
            className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-base-black/50 text-base-white backdrop-blur transition-opacity duration-200 hover:bg-base-black/80 sm:flex sm:opacity-0 sm:group-hover/carousel:opacity-100"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, i) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ir al banner ${i + 1}`}
                aria-current={i === indice}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === indice ? "w-7 bg-brand-orange" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
