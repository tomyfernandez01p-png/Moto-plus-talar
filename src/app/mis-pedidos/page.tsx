import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MisPedidosLista } from "./MisPedidosLista";
import type { PedidoResumen } from "./actions";

export const metadata: Metadata = { title: "Mis pedidos" };
export const dynamic = "force-dynamic";

export default async function MisPedidosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let deCuenta: PedidoResumen[] = [];
  if (user) {
    const { data } = await supabase
      .from("pedidos")
      .select("id, numero, estado, total, created_at")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });
    deCuenta = (data ?? []).map((p) => ({
      id: p.id,
      numero: p.numero,
      estado: String(p.estado),
      total: Number(p.total),
      created_at: p.created_at,
    }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white">Mis pedidos</h1>
      <p className="mb-6 text-sm text-base-muted">
        Tus compras y su estado. Tocá un pedido para ver el detalle.
      </p>
      <MisPedidosLista deCuenta={deCuenta} />
    </div>
  );
}
