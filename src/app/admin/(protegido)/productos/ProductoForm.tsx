"use client";

import { useState } from "react";
import Image from "next/image";
import { guardarProductoAction } from "./actions";
import { CompatibilidadEditor } from "./CompatibilidadEditor";
import type { Database } from "@/types/database";

type Producto = Database["public"]["Tables"]["productos"]["Row"];
type Categoria = Pick<Database["public"]["Tables"]["categorias"]["Row"], "id" | "nombre">;
type Marca = Pick<Database["public"]["Tables"]["marcas"]["Row"], "id" | "nombre">;
type Compatibilidad = Database["public"]["Tables"]["producto_compatibilidad"]["Row"];
type MotoCatalogo = Pick<
  Database["public"]["Tables"]["motos"]["Row"],
  "marca" | "modelo" | "anio_desde" | "anio_hasta" | "cilindrada"
>;

const inputClass =
  "w-full rounded-lg border border-base-border bg-base-dark px-3 py-2.5 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none";
const labelClass = "mb-1 block text-xs font-semibold text-base-muted";

export function ProductoForm({
  producto,
  categorias,
  marcas,
  compatibilidad,
  motos,
}: {
  producto?: Producto;
  categorias: Categoria[];
  marcas: Marca[];
  compatibilidad?: Compatibilidad[];
  motos?: MotoCatalogo[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const caracteristicasTexto = (producto?.caracteristicas ?? [])
    .map((c) => `${c.label}: ${c.value}`)
    .join("\n");

  const compatInicial = (compatibilidad ?? []).map((c) => ({
    marca: c.marca_moto ?? "",
    modelo: c.modelo_moto ?? "",
    desde: c.anio_desde?.toString() ?? "",
    hasta: c.anio_hasta?.toString() ?? "",
    cc: c.cilindrada?.toString() ?? "",
  }));

  async function onSubmit(formData: FormData) {
    setError(null);
    setGuardando(true);
    try {
      await guardarProductoAction(formData);
    } catch (e) {
      // redirect() de Next lanza un error especial (digest NEXT_REDIRECT;...)
      // que hay que dejar pasar para que la navegación ocurra.
      const digest = (e as { digest?: string })?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) throw e;
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
      setGuardando(false);
    }
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-6">
      {producto && <input type="hidden" name="id" value={producto.id} />}

      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <section className="grid gap-4 rounded-2xl border border-base-border bg-base-surface p-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input name="nombre" required defaultValue={producto?.nombre} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug (URL, opcional)</label>
          <input name="slug" defaultValue={producto?.slug} placeholder="se genera del nombre" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input name="sku" required defaultValue={producto?.sku} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Código *</label>
          <input name="codigo" required defaultValue={producto?.codigo} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Código alternativo</label>
          <input name="codigo_alternativo" defaultValue={producto?.codigo_alternativo ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Categoría</label>
          <select name="categoria_id" defaultValue={producto?.categoria_id ?? ""} className={inputClass}>
            <option value="">—</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Marca</label>
          <select name="marca_id" defaultValue={producto?.marca_id ?? ""} className={inputClass}>
            <option value="">—</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-base-border bg-base-surface p-5 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Precio *</label>
          <input type="number" step="0.01" name="precio" required defaultValue={producto?.precio} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Precio anterior</label>
          <input type="number" step="0.01" name="precio_anterior" defaultValue={producto?.precio_anterior ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Precio promocional</label>
          <input type="number" step="0.01" name="precio_promocional" defaultValue={producto?.precio_promocional ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Oferta desde</label>
          <input type="datetime-local" name="oferta_desde" defaultValue={producto?.oferta_desde?.slice(0, 16) ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Oferta hasta</label>
          <input type="datetime-local" name="oferta_hasta" defaultValue={producto?.oferta_hasta?.slice(0, 16) ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Costo (interno, no se publica)</label>
          <input type="number" step="0.01" name="costo" defaultValue={producto?.costo ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Stock *</label>
          <input type="number" name="stock" required defaultValue={producto?.stock ?? 0} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Stock mínimo (últimas unidades)</label>
          <input type="number" name="stock_minimo" defaultValue={producto?.stock_minimo ?? 3} className={inputClass} />
        </div>
      </section>

      <section className="rounded-2xl border border-base-border bg-base-surface p-5">
        <label className={labelClass}>Imagen principal</label>
        {producto?.imagen_principal_url && (
          <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-lg">
            <Image src={producto.imagen_principal_url} alt="" fill className="object-cover" />
          </div>
        )}
        <input type="file" name="imagen_principal" accept="image/*" className={inputClass} />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-base-border bg-base-surface p-5">
        <div>
          <label className={labelClass}>Descripción corta</label>
          <textarea name="descripcion_corta" rows={2} defaultValue={producto?.descripcion_corta ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Descripción completa</label>
          <textarea name="descripcion_completa" rows={5} defaultValue={producto?.descripcion_completa ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            Características (una por línea: <code>Etiqueta: Valor</code>)
          </label>
          <textarea name="caracteristicas" rows={4} defaultValue={caracteristicasTexto} className={inputClass} placeholder={"Marca: Motul\nContenido: 1L"} />
        </div>
        <div>
          <label className={labelClass}>Compatibilidad con motos</label>
          <CompatibilidadEditor motos={motos ?? []} inicial={compatInicial} />
        </div>
        <div>
          <label className={labelClass}>Tags (separados por coma)</label>
          <input name="tags" defaultValue={(producto?.tags ?? []).join(", ")} className={inputClass} />
        </div>
      </section>

      <section className="rounded-2xl border border-base-border bg-base-surface p-5">
        <h3 className="mb-3 text-sm font-bold text-brand-orange">SEO</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Título SEO</label>
            <input name="seo_title" defaultValue={producto?.seo_title ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción SEO</label>
            <input name="seo_description" defaultValue={producto?.seo_description ?? ""} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="flex gap-6 rounded-2xl border border-base-border bg-base-surface p-5">
        <label className="flex items-center gap-2 text-sm text-base-white">
          <input type="checkbox" name="destacado" defaultChecked={producto?.destacado} />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm text-base-white">
          <input type="checkbox" name="activo" defaultChecked={producto?.activo ?? true} />
          Activo (visible en la tienda)
        </label>
      </section>

      <button
        type="submit"
        disabled={guardando}
        className="rounded-xl bg-brand-orange py-3.5 text-sm font-bold text-white disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar producto"}
      </button>
    </form>
  );
}
