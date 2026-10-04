import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { guardarConfiguracionAction } from "./actions";
import { WhatsappInput } from "./WhatsappInput";

const inputClass =
  "w-full rounded-lg border border-base-border bg-base-dark px-3 py-2.5 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none";
const labelClass = "mb-1 block text-xs font-semibold text-base-muted";
const sectionClass = "rounded-2xl border border-base-border bg-base-surface p-5";
const sectionTitleClass = "mb-4 text-sm font-bold uppercase tracking-wide text-brand-orange";

export default async function AdminConfiguracionPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user?.id ?? "").single();

  if (perfil?.rol !== "administrador") {
    redirect("/admin");
  }

  const { data: config } = await supabase.from("configuracion").select("*").eq("id", 1).single();
  if (!config) {
    return <p className="text-base-muted">No se pudo cargar la configuración.</p>;
  }

  const secciones = config.secciones_home ?? {};

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Configuración del negocio</h1>

      <form action={guardarConfiguracionAction} className="flex flex-col gap-6">
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Datos del negocio</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nombre del negocio</label>
              <input name="nombre_negocio" defaultValue={config.nombre_negocio} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rubro</label>
              <input name="rubro" defaultValue={config.rubro ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" defaultValue={config.email ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (con código de país)</label>
              <WhatsappInput defaultValue={config.whatsapp ?? ""} inputClass={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección</label>
              <input name="direccion" defaultValue={config.direccion ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ciudad</label>
              <input name="ciudad" defaultValue={config.ciudad ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Provincia</label>
              <input name="provincia" defaultValue={config.provincia ?? ""} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Horarios</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Lunes a viernes</label>
              <input name="horario_lunes_viernes" defaultValue={config.horarios?.lunes_viernes ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sábado</label>
              <input name="horario_sabado" defaultValue={config.horarios?.sabado ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Domingo</label>
              <input name="horario_domingo" defaultValue={config.horarios?.domingo ?? ""} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Redes sociales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Instagram (URL)</label>
              <input name="instagram_url" defaultValue={config.instagram_url ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook (URL)</label>
              <input name="facebook_url" defaultValue={config.facebook_url ?? ""} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Logo y favicon</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Logo actual</label>
              {config.logo_url && (
                <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-lg bg-base-dark">
                  <Image src={config.logo_url} alt="" fill className="object-contain" />
                </div>
              )}
              <input type="file" name="logo" accept="image/*" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Favicon actual</label>
              {config.favicon_url && (
                <div className="relative mb-2 h-10 w-10 overflow-hidden rounded bg-base-dark">
                  <Image src={config.favicon_url} alt="" fill className="object-contain" />
                </div>
              )}
              <input type="file" name="favicon" accept="image/*" className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Métodos de pago</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-base-white">
              <input type="checkbox" name="pago_mercadopago" defaultChecked={config.metodos_pago?.mercadopago} /> Mercado
              Pago
            </label>
            <label className="flex items-center gap-2 text-sm text-base-white">
              <input type="checkbox" name="pago_transferencia" defaultChecked={config.metodos_pago?.transferencia} />{" "}
              Transferencia
            </label>
            <label className="flex items-center gap-2 text-sm text-base-white">
              <input type="checkbox" name="pago_efectivo" defaultChecked={config.metodos_pago?.efectivo} /> Efectivo (retiro
              en local)
            </label>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Public key de Mercado Pago (no es secreta, es la clave pública del SDK)</label>
            <input name="mercadopago_public_key" defaultValue={config.mercadopago_public_key ?? ""} className={inputClass} />
            <p className="mt-1 text-xs text-base-muted">
              El access token privado nunca se carga acá: se configura como variable de entorno
              (MERCADOPAGO_ACCESS_TOKEN) directamente en el servidor.
            </p>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Envíos y retiro</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-base-white">
              <input type="checkbox" name="envio_activo" defaultChecked={config.metodos_envio?.envio_activo} /> Envío a
              domicilio
            </label>
            <label className="flex items-center gap-2 text-sm text-base-white">
              <input type="checkbox" name="retiro_activo" defaultChecked={config.metodos_envio?.retiro_activo} /> Retiro en
              el local
            </label>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Costo de envío fijo ($, vacío = a coordinar)</label>
              <input
                type="number"
                name="costo_envio_fijo"
                defaultValue={config.metodos_envio?.costo_envio_fijo ?? ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Envío gratis a partir de ($, vacío = desactivado)</label>
              <input
                type="number"
                name="envio_gratis_desde"
                defaultValue={config.metodos_envio?.envio_gratis_desde ?? ""}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Catálogo</h2>
          <div>
            <label className={labelClass}>Días para mostrar la etiqueta &quot;NUEVO&quot; en un producto</label>
            <input type="number" name="dias_nuevo" defaultValue={config.dias_nuevo} className={inputClass} />
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>SEO</h2>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Título por defecto</label>
              <input name="seo_title" defaultValue={config.seo?.title ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción por defecto</label>
              <textarea name="seo_description" rows={2} defaultValue={config.seo?.description ?? ""} className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Google</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Google Analytics ID</label>
              <input name="google_analytics_id" defaultValue={config.google?.analytics_id ?? ""} placeholder="G-XXXXXXX" className={inputClass} />
            </div>
            <div className="flex flex-col gap-3 justify-center">
              <label className="flex items-center gap-2 text-sm text-base-white">
                <input type="checkbox" name="google_reviews_enabled" defaultChecked={config.google?.reviews_enabled} />{" "}
                Reseñas de Google activas
              </label>
              <label className="flex items-center gap-2 text-sm text-base-white">
                <input
                  type="checkbox"
                  name="google_search_console_verified"
                  defaultChecked={config.google?.search_console_verified}
                />{" "}
                Search Console verificado
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Link para dejar una reseña</label>
              <input
                name="google_review_url"
                defaultValue={config.google?.review_url ?? ""}
                placeholder="https://g.page/r/.../review"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-base-muted">
                Lo das de tu ficha de Google Business Profile ("Pedir reseñas" → copiar link). Con
                esto cargado aparece un botón "Dejar una reseña" en la Home.
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-base-muted">
            Las reseñas reales requieren GOOGLE_PLACES_API_KEY y GOOGLE_PLACE_ID configurados como
            variables de entorno del servidor; sin esas credenciales no se muestran reseñas
            inventadas.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Cookies</h2>
          <textarea name="cookies_texto" rows={3} defaultValue={config.cookies_texto ?? ""} className={inputClass} />
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Secciones visibles en la Home</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["seccion_hero", "Hero", secciones.hero],
              ["seccion_buscador_moto", "Buscador de moto", secciones.buscador_moto],
              ["seccion_categorias", "Categorías", secciones.categorias],
              ["seccion_destacados", "Destacados", secciones.destacados],
              ["seccion_ofertas", "Ofertas", secciones.ofertas],
              ["seccion_nuevos", "Nuevos ingresos", secciones.nuevos],
              ["seccion_marcas", "Marcas", secciones.marcas],
              ["seccion_beneficios", "Beneficios", secciones.beneficios],
              ["seccion_reviews", "Reseñas de Google", secciones.reviews],
              ["seccion_instagram", "Instagram", secciones.instagram],
              ["seccion_whatsapp", "Botón flotante de WhatsApp", secciones.whatsapp],
            ].map(([name, label, checked]) => (
              <label key={name as string} className="flex items-center gap-2 text-sm text-base-white">
                <input type="checkbox" name={name as string} defaultChecked={Boolean(checked)} /> {label as string}
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Hero de la Home</h2>
          <label className="mb-4 flex items-center gap-2 text-sm text-base-white">
            <input type="checkbox" name="hero_activo" defaultChecked={config.hero?.activo} /> Mostrar hero
          </label>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Título</label>
              <input name="hero_titulo" defaultValue={config.hero?.titulo ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtítulo</label>
              <input name="hero_subtitulo" defaultValue={config.hero?.subtitulo ?? ""} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Texto del botón</label>
                <input name="hero_boton_texto" defaultValue={config.hero?.boton_texto ?? ""} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>URL del botón</label>
                <input name="hero_boton_url" defaultValue={config.hero?.boton_url ?? ""} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Imagen de fondo</label>
              {config.hero?.imagen_url && (
                <div className="relative mb-2 h-24 w-full max-w-xs overflow-hidden rounded-lg bg-base-dark">
                  <Image src={config.hero.imagen_url} alt="" fill className="object-cover" />
                </div>
              )}
              <input type="file" name="hero_imagen" accept="image/*" className={inputClass} />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Barra de anuncio</h2>
          <label className="mb-4 flex items-center gap-2 text-sm text-base-white">
            <input type="checkbox" name="anuncio_activo" defaultChecked={config.anuncio_barra?.activo} /> Mostrar barra
          </label>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label className={labelClass}>Texto</label>
              <input name="anuncio_texto" defaultValue={config.anuncio_barra?.texto ?? ""} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Color</label>
              <input
                type="color"
                name="anuncio_color"
                defaultValue={config.anuncio_barra?.color ?? "#FF6A00"}
                className="h-[42px] w-16 rounded-lg border border-base-border bg-base-dark"
              />
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Cuentas de clientes</h2>
          <label className="flex items-center gap-2 text-sm text-base-white">
            <input type="checkbox" name="cuentas_clientes_activas" defaultChecked={config.cuentas_clientes_activas} />{" "}
            Permitir que los clientes creen una cuenta (si se desactiva, solo se puede comprar como
            invitado)
          </label>
        </section>

        <button type="submit" className="rounded-xl bg-brand-orange py-3.5 text-sm font-bold text-white">
          Guardar configuración
        </button>
      </form>
    </div>
  );
}
