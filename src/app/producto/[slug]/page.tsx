import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductoPorSlug } from "@/lib/productos";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { jsonLdScript } from "@/lib/json-ld";
import { mensajeConsultaProducto, mensajeCompatibilidad } from "@/lib/whatsapp";
import { formatPrecio } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartActions } from "@/components/product/AddToCartActions";
import { FavoritoButton } from "@/components/product/FavoritoButton";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { Acordeon } from "@/components/ui/Acordeon";
import { BackButton } from "@/components/ui/BackButton";
import { IconWhatsApp, IconTruck, IconStore } from "@/components/ui/Icons";
import { ProductCarousel } from "@/components/home/ProductCarousel";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await getProductoPorSlug(params.slug);
  if (!resultado) return {};
  const { producto } = resultado;
  return {
    title: producto.seo_title || producto.nombre,
    description: producto.seo_description || producto.descripcion_corta || undefined,
    openGraph: {
      images: producto.imagen_principal_url ? [producto.imagen_principal_url] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const resultado = await getProductoPorSlug(params.slug);
  if (!resultado) notFound();
  const { producto, imagenes, compatibilidad, relacionados } = resultado;
  const config = await getConfiguracion();

  // Ficha técnica: solo datos reales cargados (marca, categoría, código y las
  // características del producto). Nada se completa por suposición.
  const ficha: { label: string; value: string }[] = [
    ...(producto.marca_nombre ? [{ label: "Marca", value: producto.marca_nombre }] : []),
    ...(producto.categoria_nombre ? [{ label: "Categoría", value: producto.categoria_nombre }] : []),
    ...producto.caracteristicas.map((c) => ({ label: c.label, value: c.value })),
    { label: "Código", value: producto.codigo },
  ];

  const gruposCompat = Object.entries(
    compatibilidad.reduce<Record<string, typeof compatibilidad>>((acc, c) => {
      (acc[c.marca_moto ?? "Otras"] ??= []).push(c);
      return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    sku: producto.sku,
    description: producto.descripcion_corta ?? undefined,
    image: producto.imagen_principal_url ?? undefined,
    brand: producto.marca_nombre ? { "@type": "Brand", name: producto.marca_nombre } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: producto.precio_vigente,
      availability:
        producto.estado_stock === "sin_stock"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/producto/${producto.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <BackButton fallbackHref={producto.categoria_slug ? `/categoria/${producto.categoria_slug}` : "/productos"} />

      <nav className="mb-6 text-xs text-base-muted">
        <Link href="/" className="hover:text-base-white">Inicio</Link>
        {" / "}
        {producto.categoria_slug && (
          <>
            <Link href={`/categoria/${producto.categoria_slug}`} className="hover:text-base-white">
              {producto.categoria_nombre}
            </Link>
            {" / "}
          </>
        )}
        <span className="text-base-white">{producto.nombre}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative md:sticky md:top-32 md:self-start">
          <ProductGallery imagenes={imagenes} nombre={producto.nombre} />
          <FavoritoButton productoId={producto.id} className="absolute right-3 top-3 z-10" />
        </div>

        <div className="flex flex-col gap-4">
          {producto.marca_nombre && (
            <Link
              href={`/marca/${producto.marca_slug}`}
              className="text-sm font-semibold uppercase tracking-wide text-brand-orange"
            >
              {producto.marca_nombre}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-base-white md:text-3xl">{producto.nombre}</h1>
          <p className="text-xs text-base-muted">Código: {producto.codigo}</p>

          <div className="flex flex-wrap gap-2">
            {producto.en_oferta && <Badge tono="orange">Oferta</Badge>}
            {producto.es_nuevo && <Badge tono="neutral">Nuevo</Badge>}
            {producto.estado_stock === "ultimas_unidades" && (
              <Badge tono="danger">Últimas unidades</Badge>
            )}
            {producto.estado_stock === "sin_stock" && <Badge tono="neutral">Sin stock</Badge>}
          </div>

          <Price precio={producto.precio_vigente} precioAnterior={producto.precio_anterior} size="lg" />

          {producto.descripcion_corta && (
            <p className="text-sm text-base-muted">{producto.descripcion_corta}</p>
          )}

          <AddToCartActions producto={producto} />

          <a
            href={whatsappLink(config, mensajeConsultaProducto(producto))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-[#25D366] underline-offset-2 hover:underline"
          >
            <IconWhatsApp className="h-4 w-4 shrink-0" />
            ¿No sabés si sirve para tu moto? Consultanos por WhatsApp
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <h2 className="text-lg font-bold text-base-white">Descripción</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-base-muted">
          {producto.descripcion_completa || producto.descripcion_corta || "Sin descripción adicional."}
        </p>

        <div className="mt-2 flex flex-col gap-3">
          <Acordeon titulo="Ficha técnica">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-0 text-sm sm:grid-cols-2">
              {ficha.map((f) => (
                <div key={f.label} className="flex justify-between gap-3 border-b border-base-border/50 py-2">
                  <dt className="font-semibold text-base-white">{f.label}</dt>
                  <dd className="text-right text-base-muted">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Acordeon>

          <Acordeon titulo="Compatibilidad por moto">
            {compatibilidad.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {gruposCompat.map(([marca, motos]) => (
                    <div key={marca}>
                      <p className="border-b border-base-border pb-1.5 text-sm font-bold uppercase text-base-white">
                        {marca}
                      </p>
                      <ul className="mt-1.5 flex flex-col gap-1 text-sm text-brand-orange">
                        {motos.map((c) => (
                          <li key={c.id} className="font-semibold">
                            {c.modelo_moto ?? ""}
                            <span className="font-normal text-base-muted">
                              {c.anio_desde && ` · ${c.anio_desde}${c.anio_hasta ? `–${c.anio_hasta}` : "+"}`}
                              {c.cilindrada && ` · ${c.cilindrada}cc`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <a
                  href={whatsappLink(config, mensajeCompatibilidad(producto))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs font-semibold text-[#25D366] underline"
                >
                  Consultar por otra moto
                </a>
              </>
            ) : (
              <div className="flex flex-col items-start gap-2 text-sm text-base-muted">
                <p>Todavía no cargamos la compatibilidad de este producto.</p>
                <a
                  href={whatsappLink(config, mensajeCompatibilidad(producto))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#25D366] underline"
                >
                  Consultanos si sirve para tu moto
                </a>
              </div>
            )}
          </Acordeon>

          <Acordeon titulo="Envío y retiro">
            <ul className="flex flex-col gap-3 text-sm text-base-muted">
              {config.metodos_envio?.retiro_activo !== false && (
                <li className="flex items-start gap-2.5">
                  <IconStore className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  Retiro en el local: {config.direccion}, {config.ciudad}.
                </li>
              )}
              {config.metodos_envio?.envio_activo !== false && (
                <li className="flex items-start gap-2.5">
                  <IconTruck className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
                  Envío a todo el país
                  {config.metodos_envio?.envio_gratis_desde
                    ? ` — gratis en compras desde ${formatPrecio(config.metodos_envio.envio_gratis_desde)}.`
                    : config.metodos_envio?.costo_envio_fijo
                    ? ` (${formatPrecio(config.metodos_envio.costo_envio_fijo)}).`
                    : ". El costo se coordina por WhatsApp."}
                </li>
              )}
            </ul>
          </Acordeon>
        </div>
      </div>

      {relacionados.length > 0 && (
        <ProductCarousel titulo="También te puede interesar" productos={relacionados} />
      )}
    </div>
  );
}
