import { createClient } from "@/lib/supabase/server";

export interface FiltrosProductos {
  categoriaSlug?: string;
  marcaSlug?: string;
  q?: string;
  destacado?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
  marcaMoto?: string;
  modeloMoto?: string;
  anioMoto?: number;
  orden?: "relevancia" | "precio_asc" | "precio_desc" | "novedad";
  pagina?: number;
  porPagina?: number;
}

const PAGE_SIZE = 24;

const normalizar = (t: string | null | undefined) =>
  (t ?? "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * IDs de productos con compatibilidad REAL cargada para la moto elegida.
 * Coincide por `moto_id` (catálogo `motos`) o, si la fila se cargó solo con
 * texto, por marca + modelo normalizados (sin distinguir mayúsculas ni
 * espacios dobles). Una fila sin año desde/hasta se interpreta como "el
 * admin no acotó el rango" (vale para cualquier año); si SÍ tiene rango, el
 * año elegido debe caer dentro. Nunca se asume compatibilidad que no esté
 * cargada.
 */
async function productosCompatiblesConMoto(marca: string, modelo?: string, anio?: number): Promise<string[]> {
  const supabase = createClient();
  const marcaN = normalizar(marca);
  const modeloN = normalizar(modelo);

  const { data: motos } = await supabase.from("motos").select("id, marca, modelo");
  const motoIds = (motos ?? [])
    .filter((m) => normalizar(m.marca) === marcaN && (!modeloN || normalizar(m.modelo) === modeloN))
    .map((m) => m.id);

  const { data: filas } = await supabase
    .from("producto_compatibilidad")
    .select("producto_id, moto_id, marca_moto, modelo_moto, anio_desde, anio_hasta");

  const ids = (filas ?? [])
    .filter((f) => {
      const porMoto = f.moto_id != null && motoIds.includes(f.moto_id);
      const porTexto =
        normalizar(f.marca_moto) === marcaN && (!modeloN || normalizar(f.modelo_moto) === modeloN);
      if (!porMoto && !porTexto) return false;
      if (anio) {
        if (f.anio_desde != null && anio < f.anio_desde) return false;
        if (f.anio_hasta != null && anio > f.anio_hasta) return false;
      }
      return true;
    })
    .map((f) => f.producto_id);
  return Array.from(new Set(ids));
}

export async function buscarProductos(filtros: FiltrosProductos) {
  const supabase = createClient();
  const pagina = Math.max(1, filtros.pagina ?? 1);
  const porPagina = filtros.porPagina ?? PAGE_SIZE;
  const desde = (pagina - 1) * porPagina;
  const hasta = desde + porPagina - 1;

  // La compatibilidad por moto vive en otra tabla: primero resolvemos los
  // producto_id compatibles y después filtramos vista_productos por ese set.
  let idsCompatibles: string[] | null = null;
  if (filtros.marcaMoto) {
    idsCompatibles = await productosCompatiblesConMoto(
      filtros.marcaMoto,
      filtros.modeloMoto,
      filtros.anioMoto
    );
    if (idsCompatibles.length === 0) {
      return { productos: [], total: 0, pagina, porPagina };
    }
  }

  let query = supabase.from("vista_productos").select("*", { count: "exact" }).eq("activo", true);

  if (filtros.categoriaSlug) query = query.eq("categoria_slug", filtros.categoriaSlug);
  if (filtros.marcaSlug) query = query.eq("marca_slug", filtros.marcaSlug);
  if (filtros.destacado) query = query.eq("destacado", true);
  if (filtros.oferta) query = query.eq("en_oferta", true);
  if (filtros.nuevo) query = query.eq("es_nuevo", true);
  if (idsCompatibles) query = query.in("id", idsCompatibles);
  if (filtros.q) {
    const term = filtros.q.trim();
    query = query.or(
      `nombre.ilike.%${term}%,codigo.ilike.%${term}%,codigo_alternativo.ilike.%${term}%,descripcion_corta.ilike.%${term}%`
    );
  }

  switch (filtros.orden) {
    case "precio_asc":
      query = query.order("precio_vigente", { ascending: true });
      break;
    case "precio_desc":
      query = query.order("precio_vigente", { ascending: false });
      break;
    case "novedad":
      query = query.order("fecha_alta", { ascending: false });
      break;
    default:
      query = query.order("destacado", { ascending: false }).order("fecha_alta", { ascending: false });
  }

  const { data, count, error } = await query.range(desde, hasta);
  if (error) {
    console.error("buscarProductos", error);
    return { productos: [], total: 0, pagina, porPagina };
  }

  return { productos: data ?? [], total: count ?? 0, pagina, porPagina };
}

export async function getProductoPorSlug(slug: string) {
  const supabase = createClient();
  const { data: producto } = await supabase
    .from("vista_productos")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();

  if (!producto) return null;

  const [{ data: imagenes }, { data: compatibilidad }, { data: relacionados }] = await Promise.all([
    supabase
      .from("producto_imagenes")
      .select("*")
      .eq("producto_id", producto.id)
      .order("orden"),
    supabase.from("producto_compatibilidad").select("*").eq("producto_id", producto.id),
    supabase
      .from("vista_productos")
      .select("*")
      .eq("categoria_id", producto.categoria_id ?? "")
      .eq("activo", true)
      .neq("id", producto.id)
      .limit(6),
  ]);

  return { producto, imagenes: imagenes ?? [], compatibilidad: compatibilidad ?? [], relacionados: relacionados ?? [] };
}
