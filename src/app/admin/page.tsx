import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatFecha, formatPrecio } from "@/lib/format";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: totalProductos },
    { count: stockBajo },
    { count: sinStock },
    { count: ofertasActivas },
    { count: productosNuevos },
    { count: totalClientes },
    { count: pedidosNuevos },
    { data: ultimosPedidos },
    { data: ventasMes },
  ] = await Promise.all([
    supabase.from("productos").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("estado_stock", "ultimas_unidades"),
    supabase.from("productos").select("*", { count: "exact", head: true }).eq("estado_stock", "sin_stock"),
    supabase.from("vista_productos").select("*", { count: "exact", head: true }).eq("en_oferta", true),
    supabase.from("vista_productos").select("*", { count: "exact", head: true }).eq("es_nuevo", true),
    supabase.from("perfiles").select("*", { count: "exact", head: true }).eq("rol", "cliente"),
    supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("estado", "nuevo"),
    supabase.from("pedidos").select("*").order("created_at", { ascending: false }).limit(8),
    supabase
      .from("pedidos")
      .select("total, created_at")
      .gte("created_at", new Date(new Date().setDate(1)).toISOString())
      .not("estado", "eq", "cancelado"),
  ]);

  const ventasDelMes = (ventasMes ?? []).reduce((acc, p) => acc + Number(p.total), 0);

  const tarjetas = [
    { label: "Ventas del mes", value: formatPrecio(ventasDelMes) },
    { label: "Pedidos nuevos", value: pedidosNuevos ?? 0, href: "/admin/pedidos?estado=nuevo" },
    { label: "Productos activos", value: totalProductos ?? 0, href: "/admin/productos" },
    { label: "Últimas unidades", value: stockBajo ?? 0, href: "/admin/productos?stock=bajo" },
    { label: "Sin stock", value: sinStock ?? 0, href: "/admin/productos?stock=sin_stock" },
    { label: "En oferta", value: ofertasActivas ?? 0 },
    { label: "Nuevos (badge)", value: productosNuevos ?? 0 },
    { label: "Clientes registrados", value: totalClientes ?? 0 },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-base-white">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tarjetas.map((t) =>
          t.href ? (
            <Link
              key={t.label}
              href={t.href}
              className="rounded-2xl border border-base-border bg-base-surface p-5 hover:border-brand-orange/50"
            >
              <p className="text-xs text-base-muted">{t.label}</p>
              <p className="mt-1 text-2xl font-bold text-base-white">{t.value}</p>
            </Link>
          ) : (
            <div
              key={t.label}
              className="rounded-2xl border border-base-border bg-base-surface p-5"
            >
              <p className="text-xs text-base-muted">{t.label}</p>
              <p className="mt-1 text-2xl font-bold text-base-white">{t.value}</p>
            </div>
          )
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-base-white">Últimos pedidos</h2>
        <div className="overflow-x-auto rounded-2xl border border-base-border">
          <table className="w-full text-sm">
            <thead className="bg-base-surface text-left text-xs uppercase text-base-muted">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(ultimosPedidos ?? []).map((p) => (
                <tr key={p.id} className="border-t border-base-border">
                  <td className="p-3">
                    <Link href={`/admin/pedidos/${p.id}`} className="text-brand-orange hover:underline">
                      #{p.numero}
                    </Link>
                  </td>
                  <td className="p-3 text-base-white">{p.nombre} {p.apellido}</td>
                  <td className="p-3 text-base-muted">{formatFecha(p.created_at)}</td>
                  <td className="p-3 text-base-muted">{p.estado}</td>
                  <td className="p-3 text-right text-base-white">{formatPrecio(p.total)}</td>
                </tr>
              ))}
              {(ultimosPedidos ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-base-muted">
                    Todavía no hay pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
