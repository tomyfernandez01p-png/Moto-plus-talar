/**
 * Serializa datos estructurados (schema.org) para inyectarlos en un
 * <script type="application/ld+json"> vía `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` no escapa `<`, así que un valor con datos editables por
 * staff (nombre de producto, descripción, nombre del negocio) que contenga
 * literalmente "</script>" cierra el tag de golpe e inyecta HTML/JS propio
 * en la página (stored XSS). Se escapan `<`, `>` y `&` como secuencias
 * unicode, válidas dentro de un string JSON e inofensivas para cualquier
 * parser de JSON-LD, pero que ya no pueden formar un tag ni un entity HTML.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
