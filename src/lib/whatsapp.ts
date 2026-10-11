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

/** Consulta por compatibilidad cuando todavía no hay productos cargados para esa moto. */
export function mensajeCompatibilidadMoto(moto: { marca: string; modelo?: string; anio?: string | number }) {
  const detalle = [moto.marca, moto.modelo, moto.anio].filter(Boolean).join(" ");
  return `Hola Moto Plus Talar, tengo una ${detalle} y quiero saber qué repuestos tienen compatibles.`;
}

export function mensajeGenerico() {
  return "Hola Moto Plus Talar, quiero hacer una consulta.";
}

/** Mensaje del banner "¿No sabés qué repuesto necesitás?" (brief #16). */
export function mensajeConsultaFoto() {
  return "Hola Moto Plus Talar, no estoy seguro de qué repuesto necesito. ¿Les puedo mandar una foto?";
}

/**
 * Mensaje pre-armado que recibe LA DUEÑA cuando un cliente manda el
 * formulario de /mecanica: resume todo lo que ya quedó guardado en
 * `solicitudes_mecanica` para que no tenga que entrar al panel de admin
 * para enterarse de que hay una solicitud nueva. Ella sigue siendo quien
 * decide si la acepta (acá solo avisa, no confirma nada).
 */
export function mensajeSolicitudMecanica(datos: {
  numero: number;
  nombre: string;
  apellido: string;
  telefono: string;
  motoMarca?: string | null;
  motoModelo?: string | null;
  servicios: string[];
  descripcionProblema?: string | null;
  repuestoCliente?: string | null;
}) {
  const lineas = [
    `Hola, soy ${datos.nombre} ${datos.apellido} y pedí un turno de mecánica (#${datos.numero}) por la web.`,
    `Tel: ${datos.telefono}`,
  ];
  if (datos.motoMarca) {
    lineas.push(`Moto: ${datos.motoMarca}${datos.motoModelo ? ` ${datos.motoModelo}` : ""}`);
  }
  if (datos.servicios.length > 0) {
    lineas.push(`Servicios: ${datos.servicios.join(", ")}`);
  }
  if (datos.descripcionProblema) {
    lineas.push(`Problema: ${datos.descripcionProblema}`);
  }
  if (datos.repuestoCliente) {
    lineas.push(`Repuesto que quiero usar: ${datos.repuestoCliente}`);
  }
  lineas.push("Quedo atento/a a que me confirmen el turno.");
  return lineas.join("\n");
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

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

interface ItemMensaje {
  cantidad: number;
  nombre_producto: string;
  subtotal: number;
}

/**
 * Mensaje que el CLIENTE le manda al negocio al terminar su pedido: ya trae
 * todos sus datos y el detalle, así no tiene que escribirlos a mano.
 */
export function mensajePedidoNuevo(p: {
  numero: number;
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  tipoEntrega: string;
  direccion?: string | null;
  metodoPago?: string | null;
  items: ItemMensaje[];
  subtotal: number;
  costoEnvio: number;
  total: number;
}) {
  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const lineas = [
    `Hola Moto Plus Talar, soy ${p.nombre} ${p.apellido} y hice el pedido #${p.numero} por la web.`,
    "",
    ...p.items.map((i) => `• ${i.cantidad}x ${i.nombre_producto} — ${fmtARS(i.subtotal)}`),
    "",
    `Subtotal: ${fmtARS(p.subtotal)}`,
  ];
  if (p.costoEnvio > 0) lineas.push(`Envío: ${fmtARS(p.costoEnvio)}`);
  lineas.push(`Total: ${fmtARS(p.total)}`, "");
  lineas.push(p.tipoEntrega === "envio" ? `Entrega: envío a ${p.direccion || "domicilio"}` : "Entrega: retiro en el local");
  if (p.metodoPago) lineas.push(`Pago: ${p.metodoPago}`);
  lineas.push(`Tel: ${p.telefono}`, `Email: ${p.email}`);
  if (sitio) lineas.push(`Detalle: ${sitio}/pedido/${p.id}`);
  lineas.push("", "Quiero coordinar el pago y la entrega.");
  return lineas.join("\n");
}

/** Mensaje que el STAFF le comparte al cliente con el resumen/presupuesto de su pedido. */
export function mensajePedidoParaCliente(p: {
  numero: number;
  id: string;
  nombre: string;
  tipoEntrega: string;
  items: ItemMensaje[];
  subtotal: number;
  costoEnvio: number;
  total: number;
}) {
  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const lineas = [
    `Hola ${p.nombre}, te paso el resumen de tu pedido #${p.numero} de Moto Plus Talar:`,
    "",
    ...p.items.map((i) => `• ${i.cantidad}x ${i.nombre_producto} — ${fmtARS(i.subtotal)}`),
    "",
    `Subtotal: ${fmtARS(p.subtotal)}`,
  ];
  if (p.costoEnvio > 0) lineas.push(`Envío: ${fmtARS(p.costoEnvio)}`);
  lineas.push(`Total: ${fmtARS(p.total)}`);
  lineas.push(p.tipoEntrega === "envio" ? "Entrega: envío a domicilio" : "Entrega: retiro en el local");
  if (sitio) lineas.push("", `Podés verlo acá: ${sitio}/pedido/${p.id}`);
  return lineas.join("\n");
}

/** Mensaje que el STAFF le comparte al cliente con el estado de su turno de mecánica. */
export function mensajeTurnoParaCliente(t: {
  numero: number;
  nombre: string;
  estadoLabel: string;
  motoMarca?: string | null;
  motoModelo?: string | null;
  servicios: string[];
}) {
  const lineas = [`Hola ${t.nombre}, te escribimos por tu turno de mecánica #${t.numero} en Moto Plus Talar.`];
  if (t.motoMarca || t.motoModelo) lineas.push(`Moto: ${[t.motoMarca, t.motoModelo].filter(Boolean).join(" ")}`);
  if (t.servicios.length > 0) lineas.push(`Servicios: ${t.servicios.join(", ")}`);
  lineas.push(`Estado: ${t.estadoLabel}`);
  return lineas.join("\n");
}
