"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrecio } from "@/lib/format";
import { isDataUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { aplicarEdicionMasivaAction } from "./actions";

interface ProductoFila {
  id: string;
  nombre: string;
  sku: string;
  codigo: string;
  precio: number;
  stock: number;
  estado_stock: string;
  activo: boolean;
  destacado: boolean;
  imagen_principal_url: string | null;
}

type OpcionSimple = { id: string; nombre: string };

const inputClass =
  "rounded-lg border border-base-border bg-base-dark px-2 py-1.5 text-xs text-base-white";

export function ProductosTable({
  productos,
  categorias,
  marcas,
}: {
  productos: ProductoFila[];
  categorias: OpcionSimple[];
  marcas: OpcionSimple[];
}) {
  const router = useRouter();
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [aplicando, setAplicando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const todosSeleccionados = productos.length > 0 && seleccionados.size === productos.length;

  function alternarTodos() {
    setSeleccionados(todosSeleccionados ? new Set() : new Set(productos.map((p) => p.id)));
  }

  function alternarUno(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ids = useMemo(() => Array.from(seleccionados), [seleccionados]);

  async function ejecutar(input: Omit<Parameters<typeof aplicarEdicionMasivaAction>[0], "ids">) {
    if (ids.length === 0) return;
    setAplicando(true);
    setMensaje(null);
    try {
      await aplicarEdicionMasivaAction({ ids, ...input });
      setMensaje(`Listo: se actualizaron ${ids.length} producto(s).`);
      router.refresh();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se pudo aplicar la edición masiva.");
    } finally {
      setAplicando(false);
    }
  }

  return (
    <div>
      {seleccionados.size > 0 && (
        <BarraAccionesMasivas
          cantidad={seleccionados.size}
          categorias={categorias}
          marcas={marcas}
          aplicando={aplicando}
          mensaje={mensaje}
          onLimpiar={() => setSeleccionados(new Set())}
          onEjecutar={ejecutar}
        />
      )}

      <div className="overflow-x-auto rounded-2xl border border-base-border">
        <table className="w-full text-sm">
          <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
            <tr>
              <th className="w-10 p-3">
                <input type="checkbox" checked={todosSeleccionados} onChange={alternarTodos} />
              </th>
              <th className="p-3">Producto</th>
              <th className="p-3">SKU / Código</th>
              <th className="p-3 text-right">Precio</th>
              <th className="p-3 text-right">Stock</th>
              <th className="p-3">Estado</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-base-border">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={seleccionados.has(p.id)}
                    onChange={() => alternarUno(p.id)}
                  />
                </td>
                <td className="flex items-center gap-3 p-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-base-dark">
                    {p.imagen_principal_url && (
                      <Image
                        src={p.imagen_principal_url}
                        alt=""
                        fill
                        unoptimized={isDataUrl(p.imagen_principal_url)}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="text-base-white">{p.nombre}</span>
                  {p.destacado && <Badge tono="orange">★</Badge>}
                </td>
                <td className="p-3 text-base-muted">
                  {p.sku} / {p.codigo}
                </td>
                <td className="p-3 text-right text-base-white">{formatPrecio(p.precio)}</td>
                <td className="p-3 text-right text-base-white">{p.stock}</td>
                <td className="p-3">
                  {!p.activo ? (
                    <Badge tono="neutral">Inactivo</Badge>
                  ) : p.estado_stock === "sin_stock" ? (
                    <Badge tono="danger">Sin stock</Badge>
                  ) : p.estado_stock === "ultimas_unidades" ? (
                    <Badge tono="orange">Últimas unidades</Badge>
                  ) : (
                    <Badge tono="success">Disponible</Badge>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/productos/${p.id}`} className="text-brand-orange hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-base-muted">
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BarraAccionesMasivas({
  cantidad,
  categorias,
  marcas,
  aplicando,
  mensaje,
  onLimpiar,
  onEjecutar,
}: {
  cantidad: number;
  categorias: OpcionSimple[];
  marcas: OpcionSimple[];
  aplicando: boolean;
  mensaje: string | null;
  onLimpiar: () => void;
  onEjecutar: (input: Omit<Parameters<typeof aplicarEdicionMasivaAction>[0], "ids">) => void;
}) {
  const [precioModo, setPrecioModo] = useState<"set" | "incrementar_pct" | "decrementar_pct">("incrementar_pct");
  const [precioValor, setPrecioValor] = useState("");
  const [stockModo, setStockModo] = useState<"set" | "sumar" | "restar">("sumar");
  const [stockValor, setStockValor] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [ofertaPct, setOfertaPct] = useState("");
  const [ofertaDias, setOfertaDias] = useState("30");

  return (
    <div className="sticky top-0 z-10 mb-4 flex flex-col gap-3 rounded-2xl border border-brand-orange/40 bg-base-surface p-4 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-base-white">{cantidad} producto(s) seleccionados</span>
        <button onClick={onLimpiar} className="text-xs text-base-muted hover:text-base-white">
          Limpiar selección
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex items-end gap-1">
          <select value={precioModo} onChange={(e) => setPrecioModo(e.target.value as typeof precioModo)} className={inputClass}>
            <option value="incrementar_pct">Precio +%</option>
            <option value="decrementar_pct">Precio -%</option>
            <option value="set">Precio = $</option>
          </select>
          <input
            value={precioValor}
            onChange={(e) => setPrecioValor(e.target.value)}
            placeholder={precioModo === "set" ? "$" : "%"}
            className={`w-20 ${inputClass}`}
          />
          <button
            disabled={aplicando || !precioValor}
            onClick={() => onEjecutar({ precio: { modo: precioModo, valor: Number(precioValor) } })}
            className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>

        <div className="flex items-end gap-1">
          <select value={stockModo} onChange={(e) => setStockModo(e.target.value as typeof stockModo)} className={inputClass}>
            <option value="sumar">Stock + </option>
            <option value="restar">Stock - </option>
            <option value="set">Stock = </option>
          </select>
          <input
            value={stockValor}
            onChange={(e) => setStockValor(e.target.value)}
            placeholder="unidades"
            className={`w-20 ${inputClass}`}
          />
          <button
            disabled={aplicando || !stockValor}
            onClick={() => onEjecutar({ stock: { modo: stockModo, valor: Number(stockValor) } })}
            className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>

        <div className="flex items-end gap-1">
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className={inputClass}>
            <option value="">Mover a categoría…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <button
            disabled={aplicando || !categoriaId}
            onClick={() => onEjecutar({ categoriaId })}
            className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>

        <div className="flex items-end gap-1">
          <select value={marcaId} onChange={(e) => setMarcaId(e.target.value)} className={inputClass}>
            <option value="">Mover a marca…</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
          <button
            disabled={aplicando || !marcaId}
            onClick={() => onEjecutar({ marcaId })}
            className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <button
          disabled={aplicando}
          onClick={() => onEjecutar({ activo: true })}
          className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
        >
          Activar
        </button>
        <button
          disabled={aplicando}
          onClick={() => onEjecutar({ activo: false })}
          className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
        >
          Desactivar
        </button>
        <button
          disabled={aplicando}
          onClick={() => onEjecutar({ destacado: true })}
          className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
        >
          Marcar destacado
        </button>
        <button
          disabled={aplicando}
          onClick={() => onEjecutar({ destacado: false })}
          className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
        >
          Quitar destacado
        </button>
        <button
          disabled={aplicando}
          onClick={() => onEjecutar({ marcarNuevo: true })}
          className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
        >
          Marcar como NUEVO
        </button>

        <div className="flex items-end gap-1">
          <input value={ofertaPct} onChange={(e) => setOfertaPct(e.target.value)} placeholder="% off" className={`w-16 ${inputClass}`} />
          <input value={ofertaDias} onChange={(e) => setOfertaDias(e.target.value)} placeholder="días" className={`w-16 ${inputClass}`} />
          <button
            disabled={aplicando || !ofertaPct}
            onClick={() =>
              onEjecutar({
                oferta: { modo: "aplicar", porcentaje: Number(ofertaPct), dias: Number(ofertaDias || 30) },
              })
            }
            className="rounded-lg bg-brand-orange px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            Aplicar oferta
          </button>
          <button
            disabled={aplicando}
            onClick={() => onEjecutar({ oferta: { modo: "quitar" } })}
            className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white disabled:opacity-50"
          >
            Quitar oferta
          </button>
        </div>
      </div>

      {mensaje && <p className="text-xs text-base-muted">{mensaje}</p>}
    </div>
  );
}
