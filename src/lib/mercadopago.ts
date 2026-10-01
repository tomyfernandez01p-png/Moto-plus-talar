import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig } from "mercadopago";

/**
 * Devuelve el cliente de Mercado Pago solo si el negocio ya configuró su
 * access token real como variable de entorno. Nunca se inventa ni se
 * "simula" un token: si falta, todo el flujo de pago con MP se desactiva de
 * forma explícita (ver crear-preferencia/route.ts) en vez de fingir que
 * funciona.
 */
export function getMercadoPagoConfig(): MercadoPagoConfig | null {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  return new MercadoPagoConfig({ accessToken });
}

export function mercadoPagoConfigurado() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

/**
 * Verifica la firma HMAC-SHA256 que Mercado Pago manda en el header
 * `x-signature` de cada webhook, según el algoritmo oficial:
 * manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};"
 * firma esperada = HMAC_SHA256(manifest, MERCADOPAGO_WEBHOOK_SECRET) en hex.
 *
 * Sin esto, cualquiera podría pegarle a /api/mercadopago/webhook y marcar
 * pedidos como pagados sin haber pagado nada — por eso el webhook rechaza
 * la notificación entera si la firma no valida o si falta el secret.
 */
export function verificarFirmaWebhook(params: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret || !params.xSignature) return false;

  const partes = Object.fromEntries(
    params.xSignature.split(",").map((par) => {
      const [clave, valor] = par.split("=");
      return [clave?.trim(), valor?.trim()];
    })
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${params.dataId.toLowerCase()};request-id:${params.xRequestId ?? ""};ts:${ts};`;
  const firmaCalculada = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(firmaCalculada), Buffer.from(v1));
  } catch {
    return false;
  }
}
