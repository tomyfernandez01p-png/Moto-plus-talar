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
    let compatQuery = supabase
      .from("producto_compatibilidad")
      .select("producto_id")
      .ilike("marca_moto", filtros.marcaMoto);
    if (filtros.modeloMoto) compatQuery = compatQuery.ilike("modelo_moto", filtros.modeloMoto);
    if (filtros.anioMoto) {
      compatQuery = compatQuery
        .lte("anio_desde", filtros.anioMoto)
        .gte("anio_hasta", filtros.anioMoto);
    }
    const { data } = await compatQuery;
    idsCompatibles = Array.from(new Set((data ?? []).map((d) => d.producto_id)));
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
