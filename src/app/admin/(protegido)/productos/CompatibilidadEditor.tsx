"use client";

import { useState } from "react";

interface MotoCatalogo {
  marca: string;
  modelo: string;
  anio_desde: number | null;
  anio_hasta: number | null;
  cilindrada: number | null;
}

interface Fila {
  marca: string;
  modelo: string;
  desde: string;
  hasta: string;
  cc: string;
}

const inputClass =
  "w-full rounded-lg border border-base-border bg-base-dark px-2.5 py-2 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none";

/**
 * Editor de compatibilidad por producto. Reemplaza el textarea de texto
 * libre ("Honda;Wave;2010;2023;110"), donde un modelo escrito distinto al
 * del catálogo (ej. "Wave" vs "Wave 110C") nunca coincidía con el selector
 * de motos de la tienda. Acá se elige desde el catálogo `motos` (mismos
 * nombres exactos que ve el comprador) y se puede acotar el rango de años.
 *
 * Sigue enviando el MISMO campo `compatibilidad` con el MISMO formato de
 * texto que ya parsea `guardarProductoAction`, así que la acción del
 * servidor no cambia de contrato.
 */
export function CompatibilidadEditor({
  motos,
  inicial,
}: {
  motos: MotoCatalogo[];
  inicial: Fila[];
}) {
  const [filas, setFilas] = useState<Fila[]>(inicial);
  const [elegida, setElegida] = useState("");

  const serializado = filas
    .filter((f) => f.marca.trim())
    .map((f) => [f.marca, f.modelo, f.desde, f.hasta, f.cc].map((v) => v.trim()).join(";"))
    .join("\n");

  function agregarDesdeCatalogo() {
    const moto = motos[Number(elegida)];
    if (!moto) return;
    setFilas((prev) => [
      ...prev,
      {
        marca: moto.marca,
        modelo: moto.modelo,
        desde: moto.anio_desde?.toString() ?? "",
        hasta: moto.anio_hasta?.toString() ?? "",
        cc: moto.cilindrada?.toString() ?? "",
      },
    ]);
    setElegida("");
  }

  function actualizar(i: number, campo: keyof Fila, valor: string) {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, [campo]: valor } : f)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="compatibilidad" value={serializado} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <select value={elegida} onChange={(e) => setElegida(e.target.value)} className={inputClass}>
          <option value="">Elegir moto del catálogo…</option>
          {motos.map((m, i) => (
            <option key={`${m.marca}-${m.modelo}`} value={i}>
              {m.marca} {m.modelo}
              {m.anio_desde ? ` (${m.anio_desde}–${m.anio_hasta ?? "hoy"})` : ""}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={agregarDesdeCatalogo}
          disabled={elegida === ""}
          className="shrink-0 rounded-lg border border-brand-orange/70 bg-base-black px-4 py-2 text-sm font-semibold text-base-white transition-all duration-200 active:scale-95 disabled:opacity-40"
        >
          Agregar
        </button>
      </div>

      {filas.length === 0 ? (
        <p className="text-xs text-base-muted">
          Sin compatibilidades cargadas: este producto no aparecerá en las búsquedas por moto.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filas.map((f, i) => (
            <li key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-base-border p-3 sm:grid-cols-6">
              <input
                aria-label="Marca"
                value={f.marca}
                onChange={(e) => actualizar(i, "marca", e.target.value)}
                placeholder="Marca"
                className={inputClass}
              />
              <input
                aria-label="Modelo"
                value={f.modelo}
                onChange={(e) => actualizar(i, "modelo", e.target.value)}
                placeholder="Modelo"
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                aria-label="Año desde"
                inputMode="numeric"
                value={f.desde}
                onChange={(e) => actualizar(i, "desde", e.target.value)}
                placeholder="Desde"
                className={inputClass}
              />
              <input
                aria-label="Año hasta"
                inputMode="numeric"
                value={f.hasta}
                onChange={(e) => actualizar(i, "hasta", e.target.value)}
                placeholder="Hasta"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setFilas((prev) => prev.filter((_, idx) => idx !== i))}
                className="rounded-lg border border-red-500/40 px-2 py-2 text-xs text-red-300"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-base-muted">
        Dejá &quot;Desde&quot;/&quot;Hasta&quot; vacíos solo si el producto sirve para cualquier año de ese modelo.
      </p>
    </div>
  );
}
