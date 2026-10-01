import { NextRequest, NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMercadoPagoConfig, mercadoPagoConfigurado } from "@/lib/mercadopago";

export const runtime = "nodejs";

const bodySchema = z.object({ pedidoId: z.string().uuid() });

/**
 * Crea una preferencia de pago de Mercado Pago para un pedido ya generado
 * por crear_pedido() (checkout). Nunca crea el pedido acá: solo genera el
 * link de pago para uno que ya existe, y guarda el mp_preference_id en
 * `pagos` para poder conciliar después con el webhook.
 */
export async function POST(request: NextRequest) {
  if (!mercadoPagoConfigurado()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Mercado Pago todavía no está configurado en este entorno. Falta la variable de entorno MERCADOPAGO_ACCESS_TOKEN (Vercel → Settings → Environment Variables). El pedido puede coordinarse por WhatsApp mientras tanto.",
      },
      { status: 501 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "pedidoId inválido." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("id", parsed.data.pedidoId)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ ok: false, error: "Pedido no encontrado." }, { status: 404 });
  }
  if (pedido.estado !== "nuevo" && pedido.estado !== "pago_pendiente") {
    return NextResponse.json(
      { ok: false, error: "Este pedido ya no admite un nuevo intento de pago." },
      { status: 409 }
    );
  }

  const { data: items } = await supabase.from("pedido_items").select("*").eq("pedido_id", pedido.id);
  if (!items || items.length === 0) {
    return NextResponse.json({ ok: false, error: "El pedido no tiene items." }, { status: 422 });
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const preferenceItems = items.map((item) => ({
    id: item.producto_id ?? item.id,
    title: item.nombre_producto,
    quantity: item.cantidad,
    unit_price: Number(item.precio_unitario),
    currency_id: "ARS",
  }));

  if (pedido.descuento > 0) {
    preferenceItems.push({
      id: "descuento",
      title: "Descuento",
      quantity: 1,
      unit_price: -Number(pedido.descuento),
      currency_id: "ARS",
    });
  }

  try {
    const mpConfig = getMercadoPagoConfig()!;
    const preference = new Preference(mpConfig);
    const resultado = await preference.create({
      body: {
        items: preferenceItems,
        ...(pedido.costo_envio > 0
          ? { shipments: { cost: Number(pedido.costo_envio), mode: "not_specified" } }
          : {}),
        payer: {
          name: pedido.nombre,
          surname: pedido.apellido,
          email: pedido.email,
        },
        external_reference: pedido.id,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
        back_urls: {
          success: `${siteUrl}/pedido/${pedido.id}`,
          pending: `${siteUrl}/pedido/${pedido.id}`,
          failure: `${siteUrl}/pedido/${pedido.id}`,
        },
        auto_return: "approved",
      },
    });

    await supabase.from("pagos").insert({
      pedido_id: pedido.id,
      proveedor: "mercadopago",
      estado: "pendiente",
      monto: pedido.total,
      moneda: "ARS",
      mp_preference_id: resultado.id ?? null,
      raw_response: resultado as unknown as Record<string, unknown>,
    });

    if (pedido.estado === "nuevo") {
      await supabase.from("pedidos").update({ estado: "pago_pendiente", metodo_pago: "mercadopago" }).eq("id", pedido.id);
    }

    return NextResponse.json({
      ok: true,
      initPoint: resultado.init_point,
      sandboxInitPoint: resultado.sandbox_init_point,
      preferenceId: resultado.id,
    });
  } catch (error) {
    console.error("mercadopago:crear-preferencia", error);
    return NextResponse.json(
      { ok: false, error: "No se pudo iniciar el pago con Mercado Pago. Probá de nuevo en unos minutos." },
      { status: 502 }
    );
  }
}
