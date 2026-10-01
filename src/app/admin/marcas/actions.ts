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

export async function crearMarcaAction(formData: FormData) {
  const supabase = await requireStaff();
  const nombre = String(formData.get("nombre") || "").trim();
  if (!nombre) throw new Error("El nombre es obligatorio.");
  const { error } = await supabase.from("marcas").insert({ nombre, slug: slugify(nombre) });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
}

export async function actualizarMarcaAction(id: string, formData: FormData) {
  const supabase = await requireStaff();

  let logoUrl: string | undefined;
  const archivo = formData.get("logo") as File | null;
  if (archivo && archivo.size > 0) {
    const ext = archivo.name.split(".").pop() || "png";
    const path = `marcas/${id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, archivo, { contentType: archivo.type, upsert: true });
    if (uploadError) throw new Error(uploadError.message);
    logoUrl = supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("marcas")
    .update({
      nombre: String(formData.get("nombre") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim() || null,
      orden: Number(formData.get("orden") || 0),
      activo: formData.get("activo") === "on",
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
}

export async function eliminarMarcaAction(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("marcas").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/marcas");
}
