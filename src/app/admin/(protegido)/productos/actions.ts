"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import type { Caracteristica, Database } from "@/types/database";

/** Tipo exacto que Supabase espera para actualizar filas de `productos`. */
type ProductoUpdate = Database["public"]["Tables"]["productos"]["Update"];

async function requireStaff() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: perfil } = await supabase.from("perfiles").select("rol, activo").eq("id", user.id).single();
  if (!perfil || perfil.rol === "cliente" || !perfil.activo) throw new Error("Sin permisos.");
  return { supabase, userId: user.id };
}

function parseCaracteristicas(texto: string): Caracteristica[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const [label, ...resto] = linea.split(":");
      return { label: (label ?? "").trim(), value: resto.join(":").trim() };
    })
    .filter((c) => c.label);
}

function parseCompatibilidad(texto: string) {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((linea) => {
      const [marca, modelo, desde, hasta, cc] = linea.split(";").map((p) => p?.trim());
      return {
        marca_moto: marca || null,
        modelo_moto: modelo || null,
        anio_desde: desde ? Number(desde) : null,
        anio_hasta: hasta ? Number(hasta) : null,
        cilindrada: cc ? Number(cc) : null,
      };
    })
    .filter((c) => c.marca_moto);
}

export async function guardarProductoAction(formData: FormData) {
  const { supabase, userId } = await requireStaff();

  const id = String(formData.get("id") || "") || null;
  const nombre = String(formData.get("nombre") || "").trim();
  const slugManual = String(formData.get("slug") || "").trim();
  const slug = slugManual ? slugify(slugManual) : slugify(nombre);

  const datos = {
    sku: String(formData.get("sku") || "").trim(),
    codigo: String(formData.get("codigo") || "").trim(),
    codigo_alternativo: String(formData.get("codigo_alternativo") || "").trim() || null,
    nombre,
    slug,
    categoria_id: String(formData.get("categoria_id") || "") || null,
    marca_id: String(formData.get("marca_id") || "") || null,
    precio: Number(formData.get("precio") || 0),
    precio_anterior: formData.get("precio_anterior") ? Number(formData.get("precio_anterior")) : null,
    precio_promocional: formData.get("precio_promocional")
      ? Number(formData.get("precio_promocional"))
      : null,
    oferta_desde: String(formData.get("oferta_desde") || "") || null,
    oferta_hasta: String(formData.get("oferta_hasta") || "") || null,
    costo: formData.get("costo") ? Number(formData.get("costo")) : null,
    stock: Number(formData.get("stock") || 0),
    stock_minimo: Number(formData.get("stock_minimo") || 3),
    descripcion_corta: String(formData.get("descripcion_corta") || "").trim() || null,
    descripcion_completa: String(formData.get("descripcion_completa") || "").trim() || null,
    caracteristicas: parseCaracteristicas(String(formData.get("caracteristicas") || "")),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    destacado: formData.get("destacado") === "on",
    activo: formData.get("activo") === "on",
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description: String(formData.get("seo_description") || "").trim() || null,
    modificado_por: userId,
  };

  if (!datos.sku || !datos.codigo || !datos.nombre || !datos.precio) {
    throw new Error("Faltan campos obligatorios (SKU, código, nombre, precio).");
  }

  // imagen principal: si se subió un archivo nuevo, lo sube al bucket público
  let imagenPrincipalUrl: string | undefined;
  const archivo = formData.get("imagen_principal") as File | null;
  if (archivo && archivo.size > 0) {
    const ext = archivo.name.split(".").pop() || "jpg";
    const path = `productos/${datos.slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, archivo, { contentType: archivo.type, upsert: true });
    if (uploadError) throw new Error(`No se pudo subir la imagen: ${uploadError.message}`);
    const { data: pub } = supabase.storage.from("public-assets").getPublicUrl(path);
    imagenPrincipalUrl = pub.publicUrl;
  }

  let productoId = id;

  if (id) {
    const { error } = await supabase
      .from("productos")
      .update({ ...datos, ...(imagenPrincipalUrl ? { imagen_principal_url: imagenPrincipalUrl } : {}) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("productos")
      .insert({
        ...datos,
        imagen_principal_url: imagenPrincipalUrl ?? null,
        creado_por: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productoId = data.id;
  }

  // La galería de la ficha lee `producto_imagenes`, no `productos`: si solo se
  // actualizara `imagen_principal_url`, la ficha seguiría mostrando el SVG
  // genérico viejo. Al subir una foto real se vincula a ESTE producto (queda
  // primera en la galería) y se retira únicamente el placeholder embebido de
  // este mismo producto -- nunca fotos de otros productos ni fotos reales.
  if (imagenPrincipalUrl && productoId) {
    await supabase.from("producto_imagenes").delete().eq("producto_id", productoId).like("url", "data:image/svg%");
    await supabase
      .from("producto_imagenes")
      .insert({ producto_id: productoId, url: imagenPrincipalUrl, alt_text: datos.nombre, orden: 0 });
  }

  // compatibilidad: reemplaza todo el set (simple y predecible para el admin)
  const compatTexto = String(formData.get("compatibilidad") || "");
  await supabase.from("producto_compatibilidad").delete().eq("producto_id", productoId!);
  const filasCompat = parseCompatibilidad(compatTexto);
  if (filasCompat.length > 0) {
    // Si la moto existe en el catálogo `motos`, se vincula por moto_id (la
    // coincidencia exacta por marca+modelo evita depender del texto libre).
    const { data: catalogo } = await supabase.from("motos").select("id, marca, modelo");
    const norm = (t: string | null) => (t ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    await supabase.from("producto_compatibilidad").insert(
      filasCompat.map((f) => ({
        ...f,
        moto_id:
          (catalogo ?? []).find((m) => norm(m.marca) === norm(f.marca_moto) && norm(m.modelo) === norm(f.modelo_moto))
            ?.id ?? null,
        producto_id: productoId!,
      }))
    );
  }

  revalidatePath("/admin/productos");
  revalidatePath(`/producto/${datos.slug}`);
  redirect("/admin/productos");
}

export async function eliminarProductoAction(id: string) {
  const { supabase } = await requireStaff();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/productos");
}

export async function toggleActivoAction(id: string, activo: boolean) {
  const { supabase } = await requireStaff();
  await supabase.from("productos").update({ activo }).eq("id", id);
  revalidatePath("/admin/productos");
}

export interface EdicionMasivaInput {
  ids: string[];
  precio?: { modo: "set" | "incrementar_pct" | "decrementar_pct"; valor: number };
  stock?: { modo: "set" | "sumar" | "restar"; valor: number };
  categoriaId?: string | null;
  marcaId?: string | null;
  activo?: boolean;
  destacado?: boolean;
  /** Resetea fecha_alta a ahora, para que vuelva a contar como "NUEVO". */
  marcarNuevo?: boolean;
  oferta?: { modo: "aplicar"; porcentaje: number; dias: number } | { modo: "quitar" };
}

/**
 * Edición masiva sobre productos seleccionados en la lista del admin. Los
 * campos que no dependen del valor actual de cada fila (categoría, marca,
 * activo, destacado, quitar oferta) se aplican en un único UPDATE por
 * lotes. Los que sí dependen del valor actual de cada producto (precio
 * ±%, stock sumar/restar, aplicar oferta como % del precio vigente)
 * necesitan traer cada fila primero para calcular su nuevo valor: el
 * cliente supabase-js no permite expresiones tipo `precio = precio * 1.1`
 * en un `.update()`.
 */
export async function aplicarEdicionMasivaAction(input: EdicionMasivaInput) {
  const { supabase } = await requireStaff();
  if (!input.ids || input.ids.length === 0) {
    throw new Error("No se seleccionó ningún producto.");
  }

  const patchComun: ProductoUpdate = {};
  if (input.categoriaId !== undefined) patchComun.categoria_id = input.categoriaId;
  if (input.marcaId !== undefined) patchComun.marca_id = input.marcaId;
  if (input.activo !== undefined) patchComun.activo = input.activo;
  if (input.destacado !== undefined) patchComun.destacado = input.destacado;
  if (input.marcarNuevo) patchComun.fecha_alta = new Date().toISOString();
  if (input.oferta?.modo === "quitar") {
    patchComun.precio_promocional = null;
    patchComun.oferta_desde = null;
    patchComun.oferta_hasta = null;
  }

  if (Object.keys(patchComun).length > 0) {
    const { error } = await supabase.from("productos").update(patchComun).in("id", input.ids);
    if (error) throw new Error(error.message);
  }

  const necesitaLecturaPrevia = Boolean(input.precio || input.stock || input.oferta?.modo === "aplicar");
  if (necesitaLecturaPrevia) {
    const { data: filas, error } = await supabase
      .from("productos")
      .select("id, precio, stock")
      .in("id", input.ids);
    if (error) throw new Error(error.message);

    const redondear = (n: number) => Math.round(n * 100) / 100;
    const CHUNK = 20;
    const lista = filas ?? [];

    for (let i = 0; i < lista.length; i += CHUNK) {
      const lote = lista.slice(i, i + CHUNK);
      await Promise.all(
        lote.map((fila) => {
          const patch: ProductoUpdate = {};

          if (input.precio) {
            const { modo, valor } = input.precio;
            patch.precio =
              modo === "set"
                ? valor
                : modo === "incrementar_pct"
                ? redondear(fila.precio * (1 + valor / 100))
                : redondear(fila.precio * (1 - valor / 100));
          }

          if (input.stock) {
            const { modo, valor } = input.stock;
            const nuevoStock = modo === "set" ? valor : modo === "sumar" ? fila.stock + valor : fila.stock - valor;
            patch.stock = Math.max(0, Math.round(nuevoStock));
          }

          if (input.oferta?.modo === "aplicar") {
            const precioBase = (patch.precio as number | undefined) ?? fila.precio;
            patch.precio_promocional = redondear(precioBase * (1 - input.oferta.porcentaje / 100));
            patch.oferta_desde = new Date().toISOString();
            patch.oferta_hasta = new Date(Date.now() + input.oferta.dias * 24 * 60 * 60 * 1000).toISOString();
          }

          return supabase.from("productos").update(patch).eq("id", fila.id);
        })
      );
    }
  }

  revalidatePath("/admin/productos");
}
