"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database";

type Moto = Database["public"]["Tables"]["motos"]["Row"];

export function BuscadorMoto({ motos }: { motos: Moto[] }) {
  const router = useRouter();
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");

  const marcas = useMemo(() => Array.from(new Set(motos.map((m) => m.marca))).sort(), [motos]);
  const modelos = useMemo(
    () =>
      Array.from(new Set(motos.filter((m) => m.marca === marca).map((m) => m.modelo))).sort(),
    [motos, marca]
  );
  const anios = useMemo(() => {
    const moto = motos.find((m) => m.marca === marca && m.modelo === modelo);
    if (!moto || !moto.anio_desde) return [];
    const desde = moto.anio_desde;
    const hasta = moto.anio_hasta ?? new Date().getFullYear();
    const lista: number[] = [];
    for (let a = hasta; a >= desde; a--) lista.push(a);
    return lista;
  }, [motos, marca, modelo]);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (marca) params.set("marca_moto", marca);
    if (modelo) params.set("modelo_moto", modelo);
    if (anio) params.set("anio", anio);
    router.push(`/mi-moto?${params.toString()}`);
  }

  if (motos.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="rounded-2xl border border-base-border bg-base-surface p-6 md:p-8">
        <h2 className="mb-1 text-xl font-bold text-base-white">¿Qué moto tenés?</h2>
        <p className="mb-5 text-sm text-base-muted">
          Encontrá los repuestos y accesorios compatibles con tu moto.
        </p>
        <form onSubmit={buscar} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <select
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value);
              setModelo("");
              setAnio("");
            }}
            className="rounded-xl border border-base-border bg-base-dark px-3 py-3 text-sm text-base-white"
          >
            <option value="">Marca</option>
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={modelo}
            onChange={(e) => {
              setModelo(e.target.value);
              setAnio("");
            }}
            disabled={!marca}
            className="rounded-xl border border-base-border bg-base-dark px-3 py-3 text-sm text-base-white disabled:opacity-50"
          >
            <option value="">Modelo</option>
            {modelos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            disabled={!modelo}
            className="rounded-xl border border-base-border bg-base-dark px-3 py-3 text-sm text-base-white disabled:opacity-50"
          >
            <option value="">Año</option>
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={!marca}
            className="rounded-xl bg-brand-orange px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark disabled:opacity-50"
          >
            Buscar repuestos
          </button>
        </form>
      </div>
    </section>
  );
}
