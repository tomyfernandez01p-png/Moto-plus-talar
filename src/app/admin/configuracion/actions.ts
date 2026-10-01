"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * A diferencia de `requireStaff()` (usado en productos/categorías/marcas/
 * pedidos), la configuración general del negocio —incluyendo claves
 * públicas de integraciones y textos legales— queda restringida solo a
 * "administrador". Un "empleado" puede operar el catálogo y los pedidos
 * del día a día, pero no debería poder cambiar el WhatsApp del negocio, los
 * métodos de pago habilitados o el texto de cookies.
 */
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: perfil } = await supabase.from("perfiles").select("rol, activo").eq("id", user.id).single();
  if (!perfil || perfil.rol !== "administrador" || !perfil.activo) {
    throw new Error("Solo un administrador puede editar la configuración del negocio.");
  }
  return supabase;
}

async function subirImagen(
  supabase: Awaited<ReturnType<typeof requireAdmin>>,
  archivo: File,
  carpeta: string
) {
  const ext = archivo.name.split(".").pop() || "png";
  const path = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("public-assets")
    .upload(path, archivo, { contentType: archivo.type, upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from("public-assets").getPublicUrl(path).data.publicUrl;
}

function num(formData: FormData, campo: string): number | null {
  const valor = String(formData.get(campo) || "").trim();
  return valor ? Number(valor) : null;
}

export async function guardarConfiguracionAction(formData: FormData) {
  const supabase = await requireAdmin();

  // `hero` y `anuncio_barra` se guardan como un único objeto JSONB: si no
  // se subió una imagen nueva para el hero, hay que arrastrar la URL
  // existente para no perderla al pisar la columna entera.
  const { data: actual } = await supabase.from("configuracion").select("hero").eq("id", 1).single();

  let logoUrl: string | undefined;
  const logo = formData.get("logo") as File | null;
  if (logo && logo.size > 0) logoUrl = await subirImagen(supabase, logo, "config");

  let faviconUrl: string | undefined;
  const favicon = formData.get("favicon") as File | null;
  if (favicon && favicon.size > 0) faviconUrl = await subirImagen(supabase, favicon, "config");

  let heroImagenUrl: string | undefined;
  const heroImagen = formData.get("hero_imagen") as File | null;
  if (heroImagen && heroImagen.size > 0) heroImagenUrl = await subirImagen(supabase, heroImagen, "config");

  const seccionesHome = {
    hero: formData.get("seccion_hero") === "on",
    buscador_moto: formData.get("seccion_buscador_moto") === "on",
    categorias: formData.get("seccion_categorias") === "on",
    destacados: formData.get("seccion_destacados") === "on",
    ofertas: formData.get("seccion_ofertas") === "on",
    nuevos: formData.get("seccion_nuevos") === "on",
    marcas: formData.get("seccion_marcas") === "on",
    beneficios: formData.get("seccion_beneficios") === "on",
    reviews: formData.get("seccion_reviews") === "on",
    instagram: formData.get("seccion_instagram") === "on",
    whatsapp: formData.get("seccion_whatsapp") === "on",
  };

  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const soloDigitos = whatsapp.replace(/\D/g, "");

  const { error } = await supabase
    .from("configuracion")
    .update({
      nombre_negocio: String(formData.get("nombre_negocio") || "").trim(),
      rubro: String(formData.get("rubro") || "").trim() || null,
      email: String(formData.get("email") || "").trim() || null,
      whatsapp: whatsapp || null,
      whatsapp_link: soloDigitos ? `https://wa.me/${soloDigitos}` : null,
      direccion: String(formData.get("direccion") || "").trim() || null,
      ciudad: String(formData.get("ciudad") || "").trim() || null,
      provincia: String(formData.get("provincia") || "").trim() || null,
      horarios: {
        lunes_viernes: String(formData.get("horario_lunes_viernes") || "").trim(),
        sabado: String(formData.get("horario_sabado") || "").trim(),
        domingo: String(formData.get("horario_domingo") || "").trim(),
      },
      instagram_url: String(formData.get("instagram_url") || "").trim() || null,
      facebook_url: String(formData.get("facebook_url") || "").trim() || null,
      metodos_pago: {
        mercadopago: formData.get("pago_mercadopago") === "on",
        transferencia: formData.get("pago_transferencia") === "on",
        efectivo: formData.get("pago_efectivo") === "on",
      },
      metodos_envio: {
        envio_activo: formData.get("envio_activo") === "on",
        retiro_activo: formData.get("retiro_activo") === "on",
        costo_envio_fijo: num(formData, "costo_envio_fijo"),
        envio_gratis_desde: num(formData, "envio_gratis_desde"),
      },
      dias_nuevo: Number(formData.get("dias_nuevo") || 7),
      seo: {
        title: String(formData.get("seo_title") || "").trim(),
        description: String(formData.get("seo_description") || "").trim(),
      },
      google: {
        analytics_id: String(formData.get("google_analytics_id") || "").trim() || null,
        reviews_enabled: formData.get("google_reviews_enabled") === "on",
        search_console_verified: formData.get("google_search_console_verified") === "on",
      },
      mercadopago_public_key: String(formData.get("mercadopago_public_key") || "").trim() || null,
      cookies_texto: String(formData.get("cookies_texto") || "").trim() || null,
      secciones_home: seccionesHome,
      hero: {
        activo: formData.get("hero_activo") === "on",
        titulo: String(formData.get("hero_titulo") || "").trim(),
        subtitulo: String(formData.get("hero_subtitulo") || "").trim(),
        boton_texto: String(formData.get("hero_boton_texto") || "").trim(),
        boton_url: String(formData.get("hero_boton_url") || "").trim(),
        imagen_url: heroImagenUrl ?? actual?.hero?.imagen_url ?? undefined,
      },
      anuncio_barra: {
        activo: formData.get("anuncio_activo") === "on",
        texto: String(formData.get("anuncio_texto") || "").trim(),
        color: String(formData.get("anuncio_color") || "#FF6A00").trim(),
      },
      cuentas_clientes_activas: formData.get("cuentas_clientes_activas") === "on",
      ...(logoUrl ? { logo_url: logoUrl } : {}),
      ...(faviconUrl ? { favicon_url: faviconUrl } : {}),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  // La config se lee en casi todo el sitio público (Header, Footer, Home,
  // checkout…), así que hay que invalidar todo, no solo /admin.
  revalidatePath("/", "layout");
}
