import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { crearBannerAction, actualizarBannerAction, eliminarBannerAction } from "./actions";

const inputClass =
  "w-full rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white placeholder:text-base-muted";
const labelClass = "mb-1 block text-xs font-semibold text-base-muted";

export default async function AdminBannersPage() {
  const supabase = createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("orden");

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-base-white">Banners</h1>
      <p className="mb-6 text-sm text-base-muted">
        Se muestran en la Home dentro del rango de fechas configurado (si no cargás fechas, queda
        siempre visible mientras esté activo).
      </p>

      <details className="mb-8 rounded-2xl border border-base-border bg-base-surface p-4">
        <summary className="cursor-pointer text-sm font-semibold text-base-white">+ Nuevo banner</summary>
        <form action={crearBannerAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Título</label>
            <input name="titulo" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Orden</label>
            <input name="orden" type="number" defaultValue={0} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción</label>
            <input name="descripcion" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Texto del botón</label>
            <input name="boton_texto" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>URL del botón</label>
            <input name="boton_url" placeholder="/productos" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha inicio</label>
            <input type="datetime-local" name="fecha_inicio" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha fin</label>
            <input type="datetime-local" name="fecha_fin" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Imagen *</label>
            <input type="file" name="imagen" accept="image/*" required className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm text-base-white sm:col-span-2">
            <input type="checkbox" name="activo" defaultChecked /> Activo
          </label>
          <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white sm:col-span-2">
            Crear banner
          </button>
        </form>
      </details>

      <div className="flex flex-col gap-3">
        {(banners ?? []).map((banner) => {
          async function guardar(formData: FormData) {
            "use server";
            await actualizarBannerAction(banner.id, formData);
          }
          async function eliminar() {
            "use server";
            await eliminarBannerAction(banner.id);
          }
          return (
            <details key={banner.id} className="rounded-2xl border border-base-border bg-base-surface p-4">
              <summary className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-base-white">
                <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-base-dark">
                  <Image src={banner.imagen_url} alt="" fill className="object-cover" />
                </div>
                {banner.titulo || "(sin título)"} {!banner.activo && <span className="text-xs text-red-400">(oculto)</span>}
              </summary>
              <form action={guardar} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Título</label>
                  <input name="titulo" defaultValue={banner.titulo ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Orden</label>
                  <input name="orden" type="number" defaultValue={banner.orden} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Descripción</label>
                  <input name="descripcion" defaultValue={banner.descripcion ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Texto del botón</label>
                  <input name="boton_texto" defaultValue={banner.boton_texto ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>URL del botón</label>
                  <input name="boton_url" defaultValue={banner.boton_url ?? ""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha inicio</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    defaultValue={banner.fecha_inicio?.slice(0, 16) ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha fin</label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    defaultValue={banner.fecha_fin?.slice(0, 16) ?? ""}
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Reemplazar imagen</label>
                  <input type="file" name="imagen" accept="image/*" className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-sm text-base-white sm:col-span-2">
                  <input type="checkbox" name="activo" defaultChecked={banner.activo} /> Activo
                </label>
                <div className="flex gap-3 sm:col-span-2">
                  <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white">Guardar</button>
                  <button formAction={eliminar} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300">
                    Eliminar
                  </button>
                </div>
              </form>
            </details>
          );
        })}
        {(banners ?? []).length === 0 && (
          <p className="rounded-2xl border border-base-border bg-base-surface p-6 text-center text-sm text-base-muted">
            Todavía no hay banners cargados.
          </p>
        )}
      </div>
    </div>
  );
}
