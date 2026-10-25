/**
 * Decoración de temporada del sitio (Halloween, Navidad, etc.).
 *
 * - "auto": el sitio elige la temporada según la fecha de hoy en Argentina.
 * - "ninguna": sin decoración.
 * - o el id de una temporada, para forzarla desde Admin > Configuración.
 *
 * Solo cambia colores de acento, un saludo y un efecto decorativo suave.
 * No inventa ofertas, descuentos ni promociones.
 */

export type TemporadaId =
  | "halloween"
  | "navidad"
  | "anio_nuevo"
  | "pascua"
  | "dia_madre"
  | "dia_padre";

export interface Temporada {
  id: TemporadaId;
  nombre: string;
  saludo: string;
  emojis: string[];
  /** "caer": cae desde arriba (nieve). "flotar": sube y baja suave. */
  efecto: "caer" | "flotar";
  bannerFondo: string;
}

export const TEMPORADAS: Record<TemporadaId, Temporada> = {
  halloween: {
    id: "halloween",
    nombre: "Halloween",
    saludo: "Feliz Halloween",
    emojis: ["🎃", "🦇"],
    efecto: "flotar",
    bannerFondo: "#3A1F5C",
  },
  navidad: {
    id: "navidad",
    nombre: "Navidad",
    saludo: "Feliz Navidad",
    emojis: ["❄️", "🎄"],
    efecto: "caer",
    bannerFondo: "#8A1C2B",
  },
  anio_nuevo: {
    id: "anio_nuevo",
    nombre: "Año Nuevo",
    saludo: "Feliz año nuevo",
    emojis: ["✨", "🎆"],
    efecto: "flotar",
    bannerFondo: "#6B4E00",
  },
  pascua: {
    id: "pascua",
    nombre: "Pascua",
    saludo: "Felices Pascuas",
    emojis: ["🐣", "🥚"],
    efecto: "flotar",
    bannerFondo: "#5B3A9B",
  },
  dia_madre: {
    id: "dia_madre",
    nombre: "Día de la Madre",
    saludo: "Feliz Día de la Madre",
    emojis: ["🌷", "💐"],
    efecto: "flotar",
    bannerFondo: "#9B2E62",
  },
  dia_padre: {
    id: "dia_padre",
    nombre: "Día del Padre",
    saludo: "Feliz Día del Padre",
    emojis: ["🏍️", "🛠️"],
    efecto: "flotar",
    bannerFondo: "#1F4E8C",
  },
};

export const OPCIONES_TEMPORADA: { valor: string; etiqueta: string }[] = [
  { valor: "auto", etiqueta: "Automática (según la fecha)" },
  { valor: "ninguna", etiqueta: "Sin decoración" },
  ...Object.values(TEMPORADAS).map((t) => ({ valor: t.id, etiqueta: t.nombre })),
];

const ZONA = "America/Argentina/Buenos_Aires";
const DIA = 86_400_000;

/** Fecha de hoy en Argentina como milisegundos UTC a medianoche. */
function hoyArgentina(ahora: Date): { anio: number; ms: number } {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(ahora)
    .split("-")
    .map(Number);
  return { anio: y, ms: Date.UTC(y, m - 1, d) };
}

/** Domingo de Pascua (algoritmo gregoriano anónimo). */
function domingoDePascua(anio: number): number {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(anio, mes - 1, dia);
}

/** Tercer domingo de un mes (mes 0-11). */
function tercerDomingo(anio: number, mes: number): number {
  const primero = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
  const primerDomingo = 1 + ((7 - primero) % 7);
  return Date.UTC(anio, mes, primerDomingo + 14);
}

/** Temporada que corresponde a una fecha. El orden decide si dos coinciden. */
export function temporadaPorFecha(ahora: Date = new Date()): Temporada | null {
  const { anio, ms } = hoyArgentina(ahora);
  const entre = (desde: number, hasta: number) => ms >= desde && ms <= hasta;

  const madre = tercerDomingo(anio, 9);
  const padre = tercerDomingo(anio, 5);
  const pascua = domingoDePascua(anio);

  if (entre(madre - 7 * DIA, madre)) return TEMPORADAS.dia_madre;
  if (entre(Date.UTC(anio, 9, 19), Date.UTC(anio, 10, 1))) return TEMPORADAS.halloween;
  if (entre(Date.UTC(anio, 11, 1), Date.UTC(anio, 11, 25))) return TEMPORADAS.navidad;
  if (entre(Date.UTC(anio, 11, 26), Date.UTC(anio, 11, 31)) || entre(Date.UTC(anio, 0, 1), Date.UTC(anio, 0, 6))) {
    return TEMPORADAS.anio_nuevo;
  }
  if (entre(pascua - 10 * DIA, pascua + DIA)) return TEMPORADAS.pascua;
  if (entre(padre - 7 * DIA, padre)) return TEMPORADAS.dia_padre;
  return null;
}

/** Aplica la elección del admin ("auto", "ninguna" o un id). */
export function resolverTemporada(valor: string | null | undefined, ahora: Date = new Date()): Temporada | null {
  if (!valor || valor === "auto") return temporadaPorFecha(ahora);
  if (valor === "ninguna") return null;
  return TEMPORADAS[valor as TemporadaId] ?? temporadaPorFecha(ahora);
}
