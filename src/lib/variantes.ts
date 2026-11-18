/** Textos de las variantes según qué cambia (Color, Diseño, Medida, Largo…). */
const PLURALES: Record<string, string> = {
  color: "colores",
  diseño: "diseños",
  medida: "medidas",
  largo: "largos",
  contenido: "contenidos",
  versión: "versiones",
  dientes: "opciones de dientes",
};

export function pluralVariante(tipo: string | null | undefined): string {
  const t = (tipo ?? "Color").toLowerCase();
  return PLURALES[t] ?? "opciones";
}

export function verboElegir(tipo: string | null | undefined): string {
  const t = (tipo ?? "Color").toLowerCase();
  return t === "dientes" ? "Elegir opción" : `Elegir ${t}`;
}

/** Los grupos de color/diseño comparten precio; los de medida/largo/versión no. */
export function precioDesde(tipo: string | null | undefined): boolean {
  const t = (tipo ?? "Color").toLowerCase();
  return t !== "color" && t !== "diseño";
}
