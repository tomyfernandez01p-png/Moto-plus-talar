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

/**
 * Link de WhatsApp hacia un teléfono cualquiera (por ejemplo, el de un
 * cliente que hizo un pedido), a diferencia de `whatsappLink()` en
 * `lib/config.ts` que siempre apunta al WhatsApp del negocio.
 */
export function waLinkParaTelefono(telefono: string, mensaje: string) {
  const soloDigitos = telefono.replace(/\D/g, "");
  return `https://wa.me/${soloDigitos}?text=${encodeURIComponent(mensaje)}`;
}
