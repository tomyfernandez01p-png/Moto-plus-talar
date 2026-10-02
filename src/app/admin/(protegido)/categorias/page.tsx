import { createClient } from "@/lib/supabase/server";
import { crearCategoriaAction, actualizarCategoriaAction, eliminarCategoriaAction } from "./actions";

export default async function AdminCategoriasPage() {
  const supabase = createClient();
  const { data: categorias } = await supabase.from("categorias").select("*").order("orden");

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Categorías</h1>

      <form action={crearCategoriaAction} className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-base-border bg-base-surface p-4">
        <input name="nombre" required placeholder="Nueva categoría" className="flex-1 rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
        <input name="descripcion" placeholder="Descripción (opcional)" className="flex-1 rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
        <button className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white">Agregar</button>
      </form>

      <div className="flex flex-col gap-3">
        {(categorias ?? []).map((cat) => {
          async function guardar(formData: FormData) {
            "use server";
            await actualizarCategoriaAction(cat.id, formData);
          }
          async function eliminar() {
            "use server";
            await eliminarCategoriaAction(cat.id);
          }
          return (
            <details key={cat.id} className="rounded-2xl border border-base-border bg-base-surface p-4">
              <summary className="cursor-pointer text-sm font-semibold text-base-white">
                {cat.nombre} <span className="text-xs text-base-muted">/{cat.slug}</span>{" "}
                {!cat.activo && <span className="text-xs text-red-400">(oculta)</span>}
              </summary>
              <form action={guardar} className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="nombre" defaultValue={cat.nombre} className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <input name="orden" type="number" defaultValue={cat.orden} placeholder="Orden" className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <textarea name="descripcion" defaultValue={cat.descripcion ?? ""} placeholder="Descripción" className="sm:col-span-2 rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <input name="seo_title" defaultValue={cat.seo_title ?? ""} placeholder="Título SEO" className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <input name="seo_description" defaultValue={cat.seo_description ?? ""} placeholder="Descripción SEO" className="rounded-lg border border-base-border bg-base-dark px-3 py-2 text-sm text-base-white" />
                <label className="flex items-center gap-2 text-sm text-base-white">
                  <input type="checkbox" name="activo" defaultChecked={cat.activo} /> Visible en la tienda
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
      </div>
    </div>
  );
}
