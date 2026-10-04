import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { Hero } from "@/components/home/Hero";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { Beneficios } from "@/components/home/Beneficios";
import { CategoriasGrid } from "@/components/home/CategoriasGrid";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { CATEGORIAS_SERVICIO } from "@/lib/categorias-servicio";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { PromoBanner } from "@/components/home/PromoBanner";
import { WhatsAppBanner } from "@/components/home/WhatsAppBanner";
import { MarcasCarousel } from "@/components/home/MarcasCarousel";
import { BuscadorMoto } from "@/components/home/BuscadorMoto";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { StoreLocation } from "@/components/home/StoreLocation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const revalidate = 60;

export default async function HomePage() {
  const config = await getConfiguracion();
  const supabase = createClient();
  const secciones = config.secciones_home ?? {};

  const [
    { data: categoriasBase },
    { data: bannersBase },
    { data: destacados },
    { data: ofertas },
    { data: nuevos },
    { data: marcas },
    { data: motos },
    { count: totalProductos },
  ] = await Promise.all([
    supabase
      .from("categorias")
      .select("id, nombre, slug, imagen_url")
      .is("categoria_padre_id", null)
      .eq("activo", true)
      .order("orden"),
    // Banners de "publicidad" para el carrusel del tope (pedido del usuario,
    // boceto propio de referencia). La tabla y su pantalla de carga en
    // /admin/banners ya existían -- solo faltaba mostrarlos en el sitio.
    supabase.from("banners").select("*").eq("activo", true).order("orden"),
    secciones.destacados
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("destacado", true)
          .order("fecha_alta", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.ofertas
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("en_oferta", true)
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.nuevos
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("es_nuevo", true)
          .order("fecha_alta", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.marcas
      ? supabase.from("marcas").select("nombre, slug, logo_url").eq("activo", true).order("orden")
      : Promise.resolve({ data: [] }),
    secciones.buscador_moto
      ? supabase.from("motos").select("*").eq("activo", true)
      : Promise.resolve({ data: [] }),
    // Conteo real para la franja de datos del Hero (brief: nunca "+500"
    // inventado). Query liviana (head:true, sin traer filas).
    supabase.from("productos").select("id", { count: "exact", head: true }).eq("activo", true),
  ]);

  // Conteo real de productos por categoría (brief #9: "+85 productos" solo
  // si el dato existe de verdad). Son solo ~7 categorías de primer nivel,
  // así que el costo de una query liviana por cada una es despreciable, y
  // esta página ya está cacheada 60s (`revalidate` arriba).
  const categorias = await Promise.all(
    (categoriasBase ?? []).map(async (cat) => {
      const { count } = await supabase
        .from("productos")
        .select("id", { count: "exact", head: true })
        .eq("categoria_id", cat.id)
        .eq("activo", true);
      return { ...cat, cantidadProductos: count ?? undefined };
    })
  );

  // Link real para el banner "Equipá tu moto": si existe una categoría de
  // accesorios cargada de verdad, apunta ahí; si no, cae a /productos. Nunca
  // un slug inventado que podría no existir.
  const categoriaAccesorios = categorias.find((c) => c.slug === "accesorios" || c.nombre.toLowerCase().includes("accesorio"));

  // Vigencia real por fecha (brief del banner: "si no cargás fechas, queda
  // siempre visible mientras esté activo"). Se filtra acá en vez de en la
  // query para no pelear con Postgrest por el OR de nulls en dos columnas.
  const ahora = new Date().toISOString();
  const banners = (bannersBase ?? []).filter((b) => {
    if (b.fecha_inicio && b.fecha_inicio > ahora) return false;
    if (b.fecha_fin && b.fecha_fin < ahora) return false;
    return true;
  });

  // Categorías + "categorías de servicio" (ver lib/categorias-servicio.ts):
  // la dueña también hace mecánica, que no es algo que se vende sino algo
  // que se hace, así que no vive en la tabla `categorias` de productos pero
  // sí tiene que aparecer junto al resto en esta sección de la Home.
  const categoriasParaMostrar = [...categorias, ...CATEGORIAS_SERVICIO];

  // Orden de secciones (vuelta 3 del rediseño visual, pedido del usuario):
  // Publicidad (banners reales) > Hero > Beneficios > Categorías > Equipá tu
  // moto > Encontrá tu repuesto (buscador) > Marcas (todas, en movimiento) >
  // recién ahí los productos (Ofertas/Destacados/Novedades) > Banner
  // WhatsApp > Reseñas > Ubicación > Footer. La idea del usuario era que la
  // parte de arriba no sea una vidriera de productos sino publicidad +
  // navegación/CTAs, y que los productos aparezcan más abajo. Cada bloque
  // sigue aislado detrás de su propio flag de `config.secciones_home`.
  return (
    <>
      <BannerCarousel banners={banners} />

      {secciones.hero !== false && (
        <Hero config={config} totalProductos={totalProductos ?? undefined} totalMarcas={marcas?.length} />
      )}

      {secciones.beneficios !== false && <Beneficios />}

      {secciones.categorias !== false && categoriasParaMostrar.length > 3 && (
        <CategoryCarousel categorias={categoriasParaMostrar} />
      )}
      {secciones.categorias !== false && (
        <ScrollReveal className="bg-base-dark/40">
          <CategoriasGrid categorias={categoriasParaMostrar} subtitulo="Todo para mantener y equipar tu moto." />
        </ScrollReveal>
      )}

      <ScrollReveal>
        <PromoBanner
          titulo="Equipá tu moto"
          subtitulo="Todo lo que necesitás en un solo lugar."
          ctaTexto="Ver accesorios"
          ctaHref={categoriaAccesorios ? `/categoria/${categoriaAccesorios.slug}` : "/productos"}
        />
      </ScrollReveal>

      {secciones.buscador_moto && (
        <ScrollReveal className="bg-base-surface/30">
          <BuscadorMoto motos={motos ?? []} />
        </ScrollReveal>
      )}

      {secciones.marcas && (marcas ?? []).length > 0 && (
        <ScrollReveal className="bg-base-dark/60">
          <MarcasCarousel marcas={marcas ?? []} />
        </ScrollReveal>
      )}

      {secciones.ofertas && (ofertas ?? []).length > 0 && (
        <ScrollReveal>
          <OfferBanner productos={ofertas ?? []} />
          <ProductCarousel titulo="Ofertas de la semana" productos={ofertas ?? []} verTodoHref="/productos?oferta=1" />
        </ScrollReveal>
      )}

      {secciones.destacados && (
        <ScrollReveal className="bg-base-dark/60">
          <ProductCarousel titulo="Productos destacados" productos={destacados ?? []} verTodoHref="/productos?destacado=1" />
        </ScrollReveal>
      )}

      {secciones.nuevos && (
        <ScrollReveal>
          <ProductCarousel titulo="Recién llegados" productos={nuevos ?? []} verTodoHref="/productos?nuevo=1" />
        </ScrollReveal>
      )}

      <ScrollReveal className="bg-base-dark/60">
        <WhatsAppBanner config={config} />
      </ScrollReveal>

      {secciones.reviews && (
        <ScrollReveal>
          <GoogleReviews config={config} />
        </ScrollReveal>
      )}

      <ScrollReveal className="bg-base-dark/60">
        <StoreLocation config={config} />
      </ScrollReveal>
    </>
  );
}
