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

async function subirImagenBanner(supabase: Awaited<ReturnType<typeof requireStaff>>, archivo: File) {
  const ext = archivo.name.split(".").pop() || "jpg";
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("public-assets")
    .upload(path, archivo, { contentType: archivo.type, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
}

function fechaOrNull(valor: FormDataEntryValue | null) {
  const texto = String(valor || "").trim();
  return texto ? new Date(texto).toISOString() : null;
}

export async function crearBannerAction(formData: FormData) {
  const supabase = await requireStaff();

  const archivo = formData.get("imagen") as File | null;
  if (!archivo || archivo.size === 0) throw new Error("La imagen es obligatoria.");
  const imagenUrl = await subirImagenBanner(supabase, archivo);

  const { error } = await supabase.from("banners").insert({
    titulo: String(formData.get("titulo") || "").trim() || null,
    descripcion: String(formData.get("descripcion") || "").trim() || null,
    imagen_url: imagenUrl,
    boton_texto: String(formData.get("boton_texto") || "").trim() || null,
    boton_url: String(formData.get("boton_url") || "").trim() || null,
    fecha_inicio: fechaOrNull(formData.get("fecha_inicio")),
    fecha_fin: fechaOrNull(formData.get("fecha_fin")),
    orden: Number(formData.get("orden") || 0),
    activo: formData.get("activo") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
}

export async function actualizarBannerAction(id: string, formData: FormData) {
  const supabase = await requireStaff();

  let imagenUrl: string | undefined;
  const archivo = formData.get("imagen") as File | null;
  if (archivo && archivo.size > 0) {
    imagenUrl = await subirImagenBanner(supabase, archivo);
  }

  const { error } = await supabase
    .from("banners")
    .update({
      titulo: String(formData.get("titulo") || "").trim() || null,
      descripcion: String(formData.get("descripcion") || "").trim() || null,
      boton_texto: String(formData.get("boton_texto") || "").trim() || null,
      boton_url: String(formData.get("boton_url") || "").trim() || null,
      fecha_inicio: fechaOrNull(formData.get("fecha_inicio")),
      fecha_fin: fechaOrNull(formData.get("fecha_fin")),
      orden: Number(formData.get("orden") || 0),
      activo: formData.get("activo") === "on",
      ...(imagenUrl ? { imagen_url: imagenUrl } : {}),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
}

export async function eliminarBannerAction(id: string) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/banners");
}
