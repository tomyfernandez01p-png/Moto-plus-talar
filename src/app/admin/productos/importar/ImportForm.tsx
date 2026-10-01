"use client";

import { useState } from "react";
import { importarCsvAction, descargarPlantillaCsvAction, type ResultadoImportacion } from "./actions";

export function ImportForm() {
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCargando(true);
    setResultado(null);
    const formData = new FormData(e.currentTarget);
    const res = await importarCsvAction(formData);
    setResultado(res);
    setCargando(false);
  }

  async function descargarPlantilla() {
    const csv = await descargarPlantillaCsvAction();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={descargarPlantilla}
        type="button"
        className="w-fit rounded-lg border border-base-border px-4 py-2 text-sm text-base-white hover:bg-base-surface"
      >
        Descargar plantilla CSV
      </button>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <label className="text-xs font-semibold text-base-muted">
          Archivo CSV (columnas: sku, codigo, nombre, precio, stock, categoria_slug, marca_slug, …)
        </label>
        <input type="file" name="archivo" accept=".csv" required className="text-sm text-base-white" />
        <button
          type="submit"
          disabled={cargando}
          className="w-fit rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {cargando ? "Importando…" : "Importar"}
        </button>
      </form>

      {resultado && (
        <div className="rounded-2xl border border-base-border bg-base-surface p-5">
          <p className="text-sm text-base-white">
            {resultado.totalFilas} filas procesadas · {resultado.nuevos} nuevos · {resultado.actualizados}{" "}
            actualizados · {resultado.errores.length} errores
          </p>
          {resultado.errores.length > 0 && (
            <ul className="mt-3 max-h-64 overflow-y-auto text-xs text-red-300">
              {resultado.errores.map((e, i) => (
                <li key={i}>
                  Fila {e.fila}: {e.motivo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
