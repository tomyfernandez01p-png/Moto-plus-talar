import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarFirmaWebhook, mercadoPagoConfigurado } from "@/lib/mercadopago";
import type { EstadoPago, EstadoPedido } from "@/types/database";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago. Reglas de seguridad no negociables:
 *  1) Se verifica la firma HMAC del header `x-signature` contra
 *     MERCADOPAGO_WEBHOOK_SECRET antes de tocar cualquier dato — sin eso,
 *     cualquiera podría llamar a esta URL y marcar pedidos como pagados.
 *  2) El estado del pago NUNCA se toma del body que manda el webhook (se
 *     puede falsificar): siempre se vuelve a pedir el pago real a la API de
 *     Mercado Pago con el access token del servidor, y esa respuesta es la
 *     única fuente de verdad.
 *  3) Nunca se marca un pedido como pagado si MERCADOPAGO_ACCESS_TOKEN no
 *     está configurado.
 */

function mapearEstadoPago(estadoMp: string): EstadoPago {
  switch (estadoMp) {
    case "approved":
      return "aprobado";
    case "rejected":
      return "rechazado";
    case "cancelled":
      return "cancelado";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    default:
      return "pendiente"; // pending, in_process, authorized, etc.
  }
}

export async function POST(request: NextRequest) {
  if (!mercadoPagoConfigurado()) {
    // No hay integración real: no hay nada que conciliar. Se responde 200
    // para que Mercado Pago no reintente contra un entorno sin configurar.
    return NextResponse.json({ ok: true, ignorado: "mercadopago_no_configurado" });
  }

  const body = await request.json().catch(() => null);
  const searchParams = request.nextUrl.searchParams;

  const tipo = body?.type ?? body?.topic ?? searchParams.get("type") ?? searchParams.get("topic");
  const dataId = String(body?.data?.id ?? searchParams.get("id") ?? searchParams.get("data.id") ?? "");

  if (tipo !== "payment" || !dataId) {
    // Mercado Pago manda otros tipos de eventos (merchant_order, etc.) que
    // no nos interesan acá: se confirma la recepción sin procesar nada.
    return NextResponse.json({ ok: true, ignorado: tipo ?? "sin_tipo" });
  }

  const firmaValida = verificarFirmaWebhook({
    xSignature: request.headers.get("x-signature"),
    xRequestId: request.headers.get("x-request-id"),
    dataId,
  });

  if (!firmaValida) {
    console.error("mercadopago:webhook firma inválida", { dataId });
    return NextResponse.json({ ok: false, error: "Firma inválida." }, { status: 401 });
  }

  // Fuente de verdad: se le vuelve a preguntar a Mercado Pago por el pago
  // real, nunca se confía en el body del webhook.
  const respuestaPago = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    cache: "no-store",
  });

  if (!respuestaPago.ok) {
    console.error("mercadopago:webhook no se pudo obtener el pago", dataId, respuestaPago.status);
    return NextResponse.json({ ok: false, error: "No se pudo verificar el pago." }, { status: 502 });
  }

  const pago = await respuestaPago.json();
  const pedidoId: string | null = pago.external_reference ?? null;
  if (!pedidoId) {
    console.error("mercadopago:webhook pago sin external_reference", dataId);
    return NextResponse.json({ ok: true, ignorado: "sin_external_reference" });
  }

  const supabase = createAdminClient();
  const { data: pedido } = await supabase.from("pedidos").select("id, estado, total").eq("id", pedidoId).maybeSingle();
  if (!pedido) {
    console.error("mercadopago:webhook pedido no encontrado", pedidoId);
    return NextResponse.json({ ok: true, ignorado: "pedido_no_encontrado" });
  }

  const estadoPago = mapearEstadoPago(pago.status);

  // Esto inserta una fila nueva en `pagos` (no pisa la fila "pendiente" que
  // crear-preferencia/route.ts creó al generar la preferencia, porque esa
  // fila todavía no tiene mp_payment_id): es intencional, no un bug. Cada
  // fila es un evento real -"se generó el link de pago", "Mercado Pago
  // confirmó el cobro"- y el detalle del pedido en el admin las lista todas
  // en orden cronológico.
  await supabase.from("pagos").upsert(
    {
      pedido_id: pedido.id,
      proveedor: "mercadopago",
      mp_payment_id: String(pago.id),
      mp_preference_id: pago.order?.id ? String(pago.order.id) : null,
      estado: estadoPago,
      monto: Number(pago.transaction_amount ?? 0),
      moneda: pago.currency_id ?? "ARS",
      raw_response: pago,
    },
    { onConflict: "mp_payment_id" }
  );

  // El estado del pedido solo avanza automáticamente hacia adelante y nunca
  // retrocede un pedido que el staff ya movió más allá de "pago_pendiente"
  // (por ejemplo, ya "preparando" o "enviado"): evita que un webhook
  // duplicado o fuera de orden pise trabajo manual del equipo.
  const estadosPreAprobacion: EstadoPedido[] = ["nuevo", "pago_pendiente"];
  let nuevoEstadoPedido: EstadoPedido | null = null;

  // Además de que Mercado Pago confirme "approved", el monto cobrado tiene que
  // cubrir el total del pedido: si pagaron menos, no se aprueba automáticamente
  // (queda registrado en `pagos` para revisión manual del staff).
  const montoCubreTotal = Number(pago.transaction_amount ?? 0) + 0.01 >= Number(pedido.total ?? 0);
  if (estadoPago === "aprobado" && !montoCubreTotal) {
    console.error("mercadopago:webhook monto menor al total del pedido", {
      pedidoId: pedido.id,
      cobrado: pago.transaction_amount,
      total: pedido.total,
    });
  }

  if (estadoPago === "aprobado" && montoCubreTotal && estadosPreAprobacion.includes(pedido.estado)) {
    nuevoEstadoPedido = "pago_aprobado";
  } else if (
    (estadoPago === "reembolsado") &&
    pedido.estado !== "cancelado" &&
    pedido.estado !== "entregado"
  ) {
    nuevoEstadoPedido = "cancelado";
  }

  if (nuevoEstadoPedido) {
    await supabase.from("pedidos").update({ estado: nuevoEstadoPedido }).eq("id", pedido.id);
    await supabase.from("historial_cambios").insert({
      tabla: "pedidos",
      registro_id: pedido.id,
      usuario_id: null,
      accion: "cambio_estado_automatico_mercadopago",
      campo: "estado",
      valor_anterior: pedido.estado,
      valor_nuevo: nuevoEstadoPedido,
    });
  }

  return NextResponse.json({ ok: true });
}

// Mercado Pago a veces valida la URL del webhook con un GET simple.
export async function GET() {
  return NextResponse.json({ ok: true });
}
