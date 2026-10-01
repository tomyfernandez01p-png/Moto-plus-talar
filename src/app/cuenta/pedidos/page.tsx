import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatFecha, formatPrecio } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Mis pedidos" };

const estadoLabel: Record<string, string> = {
  nuevo: "Nuevo",
  pago_pendiente: "Pago pendiente",
  pago_aprobado: "Pago aprobado",
  confirmado: "Confirmado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default async function MisPedidosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/cuenta/pedidos");

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Mis pedidos</h1>
      {(pedidos ?? []).length === 0 ? (
        <p className="text-sm text-base-muted">Todavía no hiciste ningún pedido.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {(pedidos ?? []).map((p) => (
            <li key={p.id}>
              <Link
                href={`/pedido/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-base-border bg-base-surface p-4 hover:border-brand-orange/50"
              >
                <div>
                  <p className="font-semibold text-base-white">Pedido #{p.numero}</p>
                  <p className="text-xs text-base-muted">{formatFecha(p.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base-white">{formatPrecio(p.total)}</span>
                  <Badge tono="neutral">{estadoLabel[p.estado] ?? p.estado}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
