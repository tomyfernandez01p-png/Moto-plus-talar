import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { crearMarcaAction, actualizarMarcaAction, eliminarMarcaAction } from "./actions";

export default async function AdminMarcasPage() {
  const supabase = createClient();
  const { data: marcas } = await supabase.from("marcas").select("*").order("orden");

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Marcas</h1>

      <form action={crearMarcaAction} className="mb-8 flex gap-2 rounded-2xl border border-base-border bg-base-surface p-4">
        <input name="nombre" required placeholder="Nueva marca" className="flex-1 rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
        <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white">Agregar</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {(marcas ?? []).map((marca) => {
          async function guardar(formData: FormData) {
            "use server";
            await actualizarMarcaAction(marca.id, formData);
          }
          async function eliminar() {
            "use server";
            await eliminarMarcaAction(marca.id);
          }
          return (
            <details key={marca.id} className="rounded-2xl border border-base-border bg-base-surface p-4">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-base-white">
                {marca.logo_url && (
                  <div className="relative h-6 w-6 overflow-hidden rounded">
                    <Image src={marca.logo_url} alt="" fill className="object-contain" />
                  </div>
                )}
                {marca.nombre} {!marca.activo && <span className="text-xs text-red-400">(oculta)</span>}
              </summary>
              <form action={guardar} className="mt-4 flex flex-col gap-3">
                <input name="nombre" defaultValue={marca.nombre} className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <textarea name="descripcion" defaultValue={marca.descripcion ?? ""} placeholder="Descripción" className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <input name="orden" type="number" defaultValue={marca.orden} className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <input type="file" name="logo" accept="image/*" className="text-sm text-base-white" />
                <label className="flex items-center gap-2 text-sm text-base-white">
                  <input type="checkbox" name="activo" defaultChecked={marca.activo} /> Visible en la tienda
                </label>
                <div className="flex gap-3">
                  <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white">Guardar</button>
                  <button formAction={eliminar} className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300">
                    Eliminar
                  </button>
                </div>
              </form>
            </details>
          );
        })}
      </div>
    </div>
  );
}
