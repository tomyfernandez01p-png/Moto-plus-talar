import type { Database } from "@/types/database";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

/**
 * Mensaje pre-armado para consultar por un producto puntual, tal como pide
 * el brief: "Hola Moto Plus Talar, quiero consultar por: [producto] Código:
 * [código] Link: [URL]".
 */
export function mensajeConsultaProducto(producto: Pick<Producto, "nombre" | "codigo" | "slug">) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/producto/${producto.slug}`;
  return `Hola Moto Plus Talar, quiero consultar por: ${producto.nombre}\nCódigo: ${producto.codigo}\nLink: ${url}`;
}

export function mensajeCompatibilidad(producto: Pick<Producto, "nombre" | "codigo">) {
  return `Hola Moto Plus Talar, quiero saber si el producto "${producto.nombre}" (Código: ${producto.codigo}) sirve para mi moto.`;
}

export function mensajeGenerico() {
  return "Hola Moto Plus Talar, quiero hacer una consulta.";
}

/** Mensaje del banner "¿No sabés qué repuesto necesitás?" (brief #16). */
export function mensajeConsultaFoto() {
  return "Hola Moto Plus Talar, no estoy seguro de qué repuesto necesito. ¿Les puedo mandar una foto?";
}

/**
 * Link de WhatsApp hacia un teléfono cualquiera (por ejemplo, el de un
 * cliente que hizo un pedido), a diferencia de `whatsappLink()` en
 * `lib/config.ts` que siempre apunta al WhatsApp del negocio.
 */
export function waLinkParaTelefono(telefono: string, mensaje: string) {
  const soloDigitos = telefono.replace(/\D/g, "");
  // Normalización mínima y segura: si el cliente cargó el formato típico
  // "11 2297-8803" (área + número, 10 dígitos, sin 0, sin 15, sin código de
  // país) le anteponemos "54 9" para que el link de WhatsApp sea válido.
  // No tocamos ningún otro formato: adivinar mal podría mandar el mensaje
  // a otra persona.
  const digitos =
    soloDigitos.length === 10 && !soloDigitos.startsWith("54")
      ? `549${soloDigitos}`
      : soloDigitos;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}
