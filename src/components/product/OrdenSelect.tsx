"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const opciones = [
  { value: "relevancia", label: "Relevancia" },
  { value: "novedad", label: "Más nuevos" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

export function OrdenSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const actual = searchParams.get("orden") ?? "relevancia";

  function cambiar(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("orden", valor);
    params.delete("pagina");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      value={actual}
      onChange={(e) => cambiar(e.target.value)}
      className="rounded-lg border border-base-border bg-base-surface px-3 py-2 text-sm text-base-white"
      aria-label="Ordenar por"
    >
      {opciones.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
