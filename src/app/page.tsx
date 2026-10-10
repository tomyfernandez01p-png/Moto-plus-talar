import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { BannerCarousel, type BannerCarouselItem } from "@/components/home/BannerCarousel";
import { TurnosCTA } from "@/components/home/TurnosCTA";
import { CategoriasGrid } from "@/components/home/CategoriasGrid";
import { CATEGORIAS_SERVICIO } from "@/lib/categorias-servicio";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { OfferBanner } from "@/components/home/OfferBanner";
import { WhatsAppBanner } from "@/components/home/WhatsAppBanner";
import { Beneficios } from "@/components/home/Beneficios";
import { MarcasCarousel } from "@/components/home/MarcasCarousel";
import { BuscadorMoto } from "@/components/home/BuscadorMoto";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { StoreLocation } from "@/components/home/StoreLocation";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatPrecio } from "@/lib/format";
import { esFotoReal } from "@/lib/utils";

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

  // Vigencia real por fecha (brief del banner: "si no cargás fechas, queda
  // siempre visible mientras esté activo"). Se filtra acá en vez de en la
  // query para no pelear con Postgrest por el OR de nulls en dos columnas.
  const ahora = new Date().toISOString();
  const bannersReales = (bannersBase ?? []).filter((b) => {
    if (b.fecha_inicio && b.fecha_inicio > ahora) return false;
    if (b.fecha_fin && b.fecha_fin < ahora) return false;
    return true;
  });

  // Pedido explícito del usuario: si todavía no hay banners reales cargados
  // por el admin, el carrusel no puede quedar vacío -- pero tampoco se
  // inventa una promoción. Estos slides de respaldo se arman 100% a partir
  // de datos reales que esta misma página ya consultó (descuento real de
  // "ofertas", el envío configurado) o de funciones reales del sitio (la
  // mecánica con turno) -- apenas el admin carga un banner real en
  // /admin/banners, estos dejan de usarse automáticamente.
  let banners: BannerCarouselItem[] = bannersReales;
  if (banners.length === 0) {
    const descuentosReales = (ofertas ?? [])
      .filter((p) => p.precio_anterior && p.precio_anterior > p.precio_vigente)
      .map((p) => Math.round((1 - p.precio_vigente / p.precio_anterior!) * 100));
    const descuentoMaximo = descuentosReales.length > 0 ? Math.max(...descuentosReales) : null;
    // Foto real de un producto en oferta (si alguno ya tiene foto subida).
    const fotoOferta = (ofertas ?? []).find(
      (p) => p.precio_anterior && p.precio_anterior > p.precio_vigente && esFotoReal(p.imagen_principal_url)
    )?.imagen_principal_url;
    const envioGratisDesde = config.metodos_envio?.envio_gratis_desde;

    const respaldo: BannerCarouselItem[] = [];
    if (descuentoMaximo) {
      respaldo.push({
        id: "respaldo-ofertas",
        titulo: "Ofertas de la semana",
        descripcion: `Hasta ${descuentoMaximo}% OFF en productos seleccionados.`,
        imagen_url: null,
        imagen_producto_url: fotoOferta ?? null,
        icono: "oferta",
        boton_texto: "Ver ofertas",
        boton_url: "/productos?oferta=1",
      });
    }
    respaldo.push({
      id: "respaldo-turno",
      titulo: "Mecánica con turno",
      descripcion: "Reservá tu turno y coordinamos la atención.",
      imagen_url: null,
      icono: "turno",
      boton_texto: "Pedí tu turno",
      boton_url: "/mecanica",
    });
    if (config.metodos_envio?.envio_activo) {
      respaldo.push({
        id: "respaldo-envio",
        titulo: "Envíos a todo el país",
        descripcion: envioGratisDesde
          ? `Envío gratis desde ${formatPrecio(envioGratisDesde)}, o retiro en El Talar.`
          : "Lo recibís donde estés, o lo retirás en El Talar.",
        imagen_url: null,
        icono: "envio",
        boton_texto: "Ver productos",
        boton_url: "/productos",
      });
    }
    respaldo.push({
      id: "respaldo-equipar",
      titulo: "Equipá tu moto",
      descripcion: "Todo lo que necesitás para mantenerla, mejorarla y personalizarla.",
      imagen_url: null,
      icono: "equipar",
      boton_texto: "Ver categorías",
      boton_url: "/productos",
    });
    banners = respaldo;
  }

  // Categorías + "categorías de servicio" (ver lib/categorias-servicio.ts):
  // la dueña también hace mecánica, que no es algo que se vende sino algo
  // que se hace, así que no vive en la tabla `categorias` de productos pero
  // sí tiene que aparecer junto al resto en la sección "Equipá tu moto".
  const categoriasParaMostrar = [...categorias, ...CATEGORIAS_SERVICIO];

  // Orden de secciones (vuelta 4 del rediseño, reestructuración completa
  // pedida por el usuario -- ver su lista numerada): el Hero de texto
  // ("Todo lo que tu moto necesita") queda reemplazado por el carrusel de
  // publicidad como primera sección real. Publicidad > Beneficios > Pedí tu
  // turno > Encontrá tu repuesto > Equipá tu moto (categorías) > Marcas >
  // Reseñas > recién ahí los productos (Ofertas/Destacados/Novedades) >
  // Ayuda por WhatsApp > Ubicación > Footer. Cada bloque sigue aislado
  // detrás de su propio flag de `config.secciones_home` donde ya existía.
  return (
    <>
      <BannerCarousel banners={banners} />

      {secciones.beneficios !== false && <Beneficios />}

      <TurnosCTA />

      {secciones.buscador_moto && (
        <ScrollReveal className="bg-base-surface/30">
          <BuscadorMoto motos={motos ?? []} />
        </ScrollReveal>
      )}

      {secciones.categorias !== false && (
        <ScrollReveal className="bg-base-dark/40">
          <CategoriasGrid
            categorias={categoriasParaMostrar}
            titulo="Equipá tu moto"
            subtitulo="Todo lo que necesitás para mantenerla, mejorarla y personalizarla."
          />
        </ScrollReveal>
      )}

      {secciones.marcas && (marcas ?? []).length > 0 && (
        <ScrollReveal className="bg-base-dark/60">
          <MarcasCarousel marcas={marcas ?? []} />
        </ScrollReveal>
      )}

      {secciones.reviews && (
        <ScrollReveal>
          <GoogleReviews config={config} />
        </ScrollReveal>
      )}

      {secciones.ofertas && (ofertas ?? []).length > 0 && (
        <ScrollReveal className="bg-base-dark/60">
          <OfferBanner productos={ofertas ?? []} />
          <ProductCarousel titulo="Ofertas de la semana" productos={ofertas ?? []} verTodoHref="/productos?oferta=1" />
        </ScrollReveal>
      )}

      {secciones.destacados && (
        <ScrollReveal>
          <ProductCarousel titulo="Productos destacados" productos={destacados ?? []} verTodoHref="/productos?destacado=1" />
        </ScrollReveal>
      )}

      {secciones.nuevos && (
        <ScrollReveal className="bg-base-dark/60">
          <ProductCarousel titulo="Recién llegados" productos={nuevos ?? []} verTodoHref="/productos?nuevo=1" />
        </ScrollReveal>
      )}

      <ScrollReveal>
        <WhatsAppBanner config={config} />
      </ScrollReveal>

      <ScrollReveal className="bg-base-dark/60">
        <StoreLocation config={config} />
      </ScrollReveal>
    </>
  );
}
