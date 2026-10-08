"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database";
import { IconChevronDown, IconArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type Moto = Database["public"]["Tables"]["motos"]["Row"];

const selectClass =
  "w-full appearance-none rounded-xl border border-base-border bg-base-black/60 px-4 py-3.5 pr-9 text-sm text-base-white transition-colors duration-200 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange disabled:cursor-not-allowed disabled:opacity-40";

/**
 * "BikeFinder" (brief #8): misma lógica de cascada marca→modelo→año que ya
 * existía (BuscadorMoto), con un tratamiento visual de tarjeta grande con
 * glow para que se sienta como una herramienta central de la tienda y no
 * un formulario cualquiera. No se tocó ningún dato real: `motos` sigue
 * viniendo de Supabase tal como antes.
 */
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
      <div className="bg-grain relative overflow-hidden rounded-3xl border border-base-border bg-base-dark p-6 shadow-card md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-orange/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand-orange/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-orange">
            Compatibilidad
          </span>
          <h2 className="text-2xl font-bold text-base-white md:text-3xl">
            Encontrá el repuesto para tu moto
          </h2>
          <p className="mb-5 max-w-xl text-sm text-base-muted">
            Seleccioná tu moto para encontrar productos compatibles.
          </p>
        </div>

        <form
          onSubmit={buscar}
          className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="relative">
            <select
              value={marca}
              onChange={(e) => {
                setMarca(e.target.value);
                setModelo("");
                setAnio("");
              }}
              className={selectClass}
            >
              <option value="">Marca</option>
              {marcas.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          </div>

          <div className="relative">
            <select
              value={modelo}
              onChange={(e) => {
                setModelo(e.target.value);
                setAnio("");
              }}
              disabled={!marca}
              className={selectClass}
            >
              <option value="">Modelo</option>
              {modelos.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          </div>

          <div className="relative">
            <select
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              disabled={!modelo}
              className={selectClass}
            >
              <option value="">Año</option>
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          </div>

          <button
            type="submit"
            disabled={!marca}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-brand-orange/70 bg-base-black px-5 py-4 text-base font-semibold text-base-white shadow-glow-sm transition-all duration-200 hover:border-brand-orange hover:bg-base-dark hover:shadow-glow active:scale-95 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Ver productos compatibles
            <IconArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </section>
  );
}
