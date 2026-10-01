import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductoPorSlug } from "@/lib/productos";
import { whatsappLink } from "@/lib/config";
import { getConfiguracion } from "@/lib/config.server";
import { jsonLdScript } from "@/lib/json-ld";
import { mensajeConsultaProducto, mensajeCompatibilidad } from "@/lib/whatsapp";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartActions } from "@/components/product/AddToCartActions";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
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
        <ProductGallery imagenes={imagenes} nombre={producto.nombre} />

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

          <div className="flex gap-2">
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
            className="text-center text-sm font-semibold text-[#25D366] underline underline-offset-2"
          >
            ¿No sabés si sirve para tu moto? Consultanos por WhatsApp
          </a>

          {producto.caracteristicas.length > 0 && (
            <div className="mt-2 rounded-xl border border-base-border p-4">
              <h2 className="mb-2 text-sm font-bold text-base-white">Características</h2>
              <dl className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
                {producto.caracteristicas.map((c, i) => (
                  <div key={i} className="flex justify-between gap-2 border-b border-base-border/50 py-1">
                    <dt className="text-base-muted">{c.label}</dt>
                    <dd className="text-base-white">{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {compatibilidad.length > 0 && (
            <div className="rounded-xl border border-base-border p-4">
              <h2 className="mb-2 text-sm font-bold text-base-white">Compatibilidad</h2>
              <ul className="flex flex-col gap-1 text-sm text-base-muted">
                {compatibilidad.map((c) => (
                  <li key={c.id}>
                    {c.marca_moto} {c.modelo_moto}
                    {c.anio_desde && ` (${c.anio_desde}${c.anio_hasta ? `–${c.anio_hasta}` : "+"})`}
                    {c.cilindrada && ` · ${c.cilindrada}cc`}
                  </li>
                ))}
              </ul>
              <a
                href={whatsappLink(config, mensajeCompatibilidad(producto))}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-[#25D366] underline"
              >
                Consultar por otra moto
              </a>
            </div>
          )}
        </div>
      </div>

      {producto.descripcion_completa && (
        <div className="mt-10 max-w-3xl">
          <h2 className="mb-3 text-lg font-bold text-base-white">Descripción</h2>
          <p className="whitespace-pre-line text-sm text-base-muted">
            {producto.descripcion_completa}
          </p>
        </div>
      )}

      {relacionados.length > 0 && (
        <ProductCarousel titulo="También te puede interesar" productos={relacionados} />
      )}
    </div>
  );
}
