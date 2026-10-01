"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";

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

export async function crearCategoriaAction(formData: FormData) {
  const supabase = await requireStaff();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) throw new Error("El nombre es obligatorio.");
  const { error } = await supabase.from("categorias").insert({
    nombre,
    slug: slugify(nombre),
    descripcion: String(formData.get("descripcion") || "").trim() || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}

export async function actualizarCategoriaAction(id: string, formData: FormData) {
  const supabase = await requireStaff();
  const nombre = String(formData.get("nombre") || "").trim();
  const { error } = await supabase
    .from("categorias")
    .update({
      nombre,
      descripcion: String(formData.get("descripcion") || "").trim() || null,
      orden: Number(formData.get("orden") || 0),
      activo: formData.get("activo") === "on",
      seo_title: String(formData.get("seo_title") || "").trim() || null,
      seo_description: String(formData.get("seo_description") || "").trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}

export async function eliminarCategoriaAction(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("categorias").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/categorias");
}
