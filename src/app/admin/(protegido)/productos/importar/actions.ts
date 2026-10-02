"use server";

import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import type { Database } from "@/types/database";

/**
 * Registro ya validado y listo para `upsert`, con el tipo exacto que
 * Supabase espera para la tabla `productos` (generado a partir del schema:
 * exige sku/codigo/nombre/slug/precio y admite el resto de columnas como
 * opcionales). Evita `Record<string, unknown>[]`, que no matchea ningún
 * overload de `upsert`.
 */
type ProductoInsert = Database["public"]["Tables"]["productos"]["Insert"];

interface FilaCsv {
  sku?: string;
  codigo?: string;
  codigo_alternativo?: string;
  nombre?: string;
  categoria_slug?: string;
  marca_slug?: string;
  precio?: string;
  precio_anterior?: string;
  precio_promocional?: string;
  stock?: string;
  stock_minimo?: string;
  descripcion_corta?: string;
  tags?: string;
  destacado?: string;
  activo?: string;
}

export interface ResultadoImportacion {
  ok: boolean;
  totalFilas: number;
  nuevos: number;
  actualizados: number;
  errores: { fila: number; motivo: string }[];
}

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

export async function importarCsvAction(formData: FormData): Promise<ResultadoImportacion> {
  const supabase = await requireStaff();
  const archivo = formData.get("archivo") as File | null;

  if (!archivo || archivo.size === 0) {
    return { ok: false, totalFilas: 0, nuevos: 0, actualizados: 0, errores: [{ fila: 0, motivo: "No se adjuntó ningún archivo." }] };
  }

  const texto = await archivo.text();
  let filas: FilaCsv[];
  try {
    filas = parse(texto, { columns: true, skip_empty_lines: true, trim: true }) as FilaCsv[];
  } catch (e) {
    return {
      ok: false,
      totalFilas: 0,
      nuevos: 0,
      actualizados: 0,
      errores: [{ fila: 0, motivo: `CSV inválido: ${e instanceof Error ? e.message : "error de formato"}` }],
    };
  }

  const [{ data: categorias }, { data: marcas }, { data: existentes }] = await Promise.all([
    supabase.from("categorias").select("id, slug"),
    supabase.from("marcas").select("id, slug"),
    supabase.from("productos").select("sku"),
  ]);

  const categoriaPorSlug = new Map((categorias ?? []).map((c) => [c.slug, c.id]));
  const marcaPorSlug = new Map((marcas ?? []).map((m) => [m.slug, m.id]));
  const skusExistentes = new Set((existentes ?? []).map((p) => p.sku));

  const errores: { fila: number; motivo: string }[] = [];
  const filasValidas: ProductoInsert[] = [];
  let nuevos = 0;
  let actualizados = 0;

  filas.forEach((fila, idx) => {
    const numeroFila = idx + 2; // +2: encabezado + índice base 1
    const sku = fila.sku?.trim();
    const codigo = fila.codigo?.trim();
    const nombre = fila.nombre?.trim();
    const precio = Number(fila.precio);

    if (!sku || !codigo || !nombre) {
      errores.push({ fila: numeroFila, motivo: "Faltan sku, codigo o nombre." });
      return;
    }
    if (!fila.precio || Number.isNaN(precio) || precio < 0) {
      errores.push({ fila: numeroFila, motivo: "Precio inválido." });
      return;
    }
    if (fila.categoria_slug && !categoriaPorSlug.has(fila.categoria_slug)) {
      errores.push({ fila: numeroFila, motivo: `Categoría "${fila.categoria_slug}" no existe.` });
      return;
    }
    if (fila.marca_slug && !marcaPorSlug.has(fila.marca_slug)) {
      errores.push({ fila: numeroFila, motivo: `Marca "${fila.marca_slug}" no existe.` });
      return;
    }

    if (skusExistentes.has(sku)) actualizados++;
    else nuevos++;

    filasValidas.push({
      sku,
      codigo,
      codigo_alternativo: fila.codigo_alternativo || null,
      nombre,
      slug: slugify(nombre),
      categoria_id: fila.categoria_slug ? categoriaPorSlug.get(fila.categoria_slug) ?? null : null,
      marca_id: fila.marca_slug ? marcaPorSlug.get(fila.marca_slug) ?? null : null,
      precio,
      precio_anterior: fila.precio_anterior ? Number(fila.precio_anterior) : null,
      precio_promocional: fila.precio_promocional ? Number(fila.precio_promocional) : null,
      stock: fila.stock ? Number(fila.stock) : 0,
      stock_minimo: fila.stock_minimo ? Number(fila.stock_minimo) : 3,
      descripcion_corta: fila.descripcion_corta || null,
      tags: fila.tags ? fila.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      destacado: fila.destacado?.toLowerCase() === "true",
      activo: fila.activo?.toLowerCase() !== "false",
    });
  });

  if (filasValidas.length > 0) {
    const TAMANO_LOTE = 500;
    for (let i = 0; i < filasValidas.length; i += TAMANO_LOTE) {
      const lote = filasValidas.slice(i, i + TAMANO_LOTE);
      const { error } = await supabase.from("productos").upsert(lote, { onConflict: "sku" });
      if (error) {
        errores.push({ fila: 0, motivo: `Error al guardar el lote ${i / TAMANO_LOTE + 1}: ${error.message}` });
      }
    }
    revalidatePath("/admin/productos");
  }

  return { ok: true, totalFilas: filas.length, nuevos, actualizados, errores };
}

export async function descargarPlantillaCsvAction() {
  await requireStaff();
  const columnas = [
    "sku",
    "codigo",
    "codigo_alternativo",
    "nombre",
    "categoria_slug",
    "marca_slug",
    "precio",
    "precio_anterior",
    "precio_promocional",
    "stock",
    "stock_minimo",
    "descripcion_corta",
    "tags",
    "destacado",
    "activo",
  ];
  const ejemplo = [
    "ACE-MOT-7100",
    "MOT7100-10W40",
    "",
    "Aceite Motul 7100 10W40 1L",
    "aceites-y-lubricantes",
    "motul",
    "14990",
    "",
    "",
    "25",
    "5",
    "Aceite sintético 100% para motos de alta cilindrada.",
    "aceite,sintetico",
    "true",
    "true",
  ];
  return stringify([columnas, ejemplo]);
}
