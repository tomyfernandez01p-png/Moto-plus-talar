"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: perfil } = await supabase.from("perfiles").select("rol, activo").eq("id", user.id).single();
  if (!perfil || perfil.rol === "cliente" || !perfil.activo) throw new Error("Sin permisos.");
  return supabase;
}

export interface ResultadoVinculo {
  ok: boolean;
  mensaje?: string;
}

/**
 * Vincula una foto ya subida a Supabase Storage (bucket público
 * `public-assets`) con un producto existente, por slug. Idempotente: si ya
 * tiene esa misma URL no duplica nada. Solo reemplaza la imagen principal si
 * el producto no tiene foto real (vacía o el SVG genérico demo) o si ya era
 * una foto de esta misma importación; nunca pisa una foto que el admin subió.
 */
export async function vincularImagenProductoAction(slug: string, url: string): Promise<ResultadoVinculo> {
  const supabase = await requireStaff();
  if (!/^https:\/\/[^/]+\/storage\/v1\/object\/public\/public-assets\/catalogo\/productos\//.test(url)) {
    return { ok: false, mensaje: "URL de imagen no válida." };
  }
  const { data: prod } = await supabase
    .from("productos")
    .select("id, nombre, imagen_principal_url")
    .eq("slug", slug)
    .maybeSingle();
  if (!prod) return { ok: false, mensaje: "Producto no encontrado." };

  const actual = prod.imagen_principal_url ?? "";
  const esPlaceholder = actual === "" || actual.startsWith("data:image/svg");
  const esDeImportacion = actual.includes("/public-assets/catalogo/productos/");
  if (!esPlaceholder && !esDeImportacion) {
    return { ok: false, mensaje: "Tiene una foto cargada a mano; no se modificó." };
  }

  const { error } = await supabase.from("productos").update({ imagen_principal_url: url }).eq("id", prod.id);
  if (error) return { ok: false, mensaje: error.message };

  await supabase.from("producto_imagenes").delete().eq("producto_id", prod.id).like("url", "data:image/svg%");
  const { data: ya } = await supabase
    .from("producto_imagenes")
    .select("id")
    .eq("producto_id", prod.id)
    .eq("url", url)
    .limit(1);
  if (!ya || ya.length === 0) {
    const { error: e2 } = await supabase
      .from("producto_imagenes")
      .insert({ producto_id: prod.id, url, alt_text: prod.nombre, orden: 0 });
    if (e2) return { ok: false, mensaje: e2.message };
  }
  return { ok: true };
}

/** Vincula un logo ya subido con una marca existente (por slug). Solo si no tiene logo propio. */
export async function vincularLogoMarcaAction(slug: string, url: string): Promise<ResultadoVinculo> {
  const supabase = await requireStaff();
  if (!/^https:\/\/[^/]+\/storage\/v1\/object\/public\/public-assets\/catalogo\/marcas\//.test(url)) {
    return { ok: false, mensaje: "URL de logo no válida." };
  }
  const { data: marca } = await supabase.from("marcas").select("id, logo_url").eq("slug", slug).maybeSingle();
  if (!marca) return { ok: false, mensaje: "Marca no encontrada." };
  const actual = marca.logo_url ?? "";
  if (actual && !actual.includes("/public-assets/catalogo/marcas/")) {
    return { ok: false, mensaje: "Ya tiene un logo cargado a mano; no se modificó." };
  }
  const { error } = await supabase.from("marcas").update({ logo_url: url }).eq("id", marca.id);
  if (error) return { ok: false, mensaje: error.message };
  return { ok: true };
}

export async function revalidarCatalogoAction() {
  await requireStaff();
  revalidatePath("/", "layout");
}
