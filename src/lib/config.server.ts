import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Configuracion } from "@/lib/config";

/**
 * Todo lo que necesita leer la base (y por lo tanto `next/headers` vía
 * `@/lib/supabase/server`) vive acá, separado de `@/lib/config`. El import
 * "server-only" hace fallar el build explícitamente -- en vez de con el
 * error genérico de react-server-components -- si algún Client Component
 * llegara a importar este archivo por error.
 */

const CONFIG_POR_DEFECTO: Configuracion = {
  id: 1,
  nombre_negocio: "Moto Plus Talar",
  rubro: "Repuestos y accesorios para motos. Mecánica con turno.",
  logo_url: null,
  favicon_url: null,
  email: "motoplustalar@gmail.com",
  whatsapp: "+54 9 11 2297-8803",
  whatsapp_link: "https://wa.me/5491122978803",
  direccion: "Av. Hipólito Yrigoyen 2188",
  ciudad: "El Talar",
  provincia: "Buenos Aires",
  horarios: {
    lunes_viernes: "9:00 - 19:00",
    sabado: "9:00 - 13:00",
    domingo: "Cerrado",
  },
  instagram_url: "https://www.instagram.com/motoplus_talar/",
  facebook_url: "https://www.facebook.com/share/1D4qaxTAH4/",
  metodos_pago: { mercadopago: false, transferencia: true, efectivo: true },
  metodos_envio: {
    envio_activo: true,
    retiro_activo: true,
    costo_envio_fijo: null,
    envio_gratis_desde: null,
  },
  dias_nuevo: 7,
  seo: {
    title: "Moto Plus Talar — Repuestos y accesorios para motos en El Talar",
    description:
      "Repuestos y accesorios para motos en El Talar, Buenos Aires. Mecánica con turno, envíos a todo el país y retiro en el local.",
  },
  google: { analytics_id: null, reviews_enabled: false, search_console_verified: false, review_url: null },
  mercadopago_public_key: null,
  cookies_texto:
    "Usamos cookies para mejorar tu experiencia. Podés aceptar, rechazar las no esenciales o configurar tus preferencias.",
  secciones_home: {
    hero: true,
    buscador_moto: true,
    categorias: true,
    destacados: true,
    ofertas: true,
    nuevos: true,
    marcas: true,
    beneficios: true,
    reviews: true,
    instagram: true,
    whatsapp: true,
  },
  hero: {
    activo: true,
    titulo: "TODO LO QUE TU MOTO NECESITA",
    subtitulo: "Calidad, confianza y el mejor servicio.",
    boton_texto: "Ver productos",
    boton_url: "/productos",
  },
  anuncio_barra: { activo: false, texto: "", color: "#FF6A00" },
  cuentas_clientes_activas: true,
  updated_at: new Date().toISOString(),
};

/**
 * Trae la fila única de `configuracion`. Memoizado por request (React
 * `cache`) para no pegarle a la base una vez por sección de la Home. Si la
 * base no responde, cae a valores por defecto (nunca rompe el render
 * público por un problema transitorio de conexión).
 */
export const getConfiguracion = cache(async (): Promise<Configuracion> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("configuracion").select("*").eq("id", 1).single();
    if (error || !data) return CONFIG_POR_DEFECTO;
    return data;
  } catch {
    return CONFIG_POR_DEFECTO;
  }
});
