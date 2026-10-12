/** "Mi moto": la moto que el cliente guardó en este navegador para ver rápido sus repuestos. */
const CLAVE = "mpt_mi_moto_v1";

export interface MiMoto {
  marca: string;
  modelo: string;
  anio: string;
}

export function leerMiMoto(): MiMoto | null {
  try {
    const raw = window.localStorage.getItem(CLAVE);
    if (!raw) return null;
    const m = JSON.parse(raw);
    if (m && typeof m.marca === "string" && m.marca) {
      return {
        marca: m.marca,
        modelo: typeof m.modelo === "string" ? m.modelo : "",
        anio: typeof m.anio === "string" ? m.anio : "",
      };
    }
  } catch {
    // ignorar
  }
  return null;
}

export function guardarMiMoto(moto: MiMoto) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(moto));
  } catch {
    // ignorar
  }
}

export function borrarMiMoto() {
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // ignorar
  }
}

export function urlRepuestosMoto(m: MiMoto): string {
  const params = new URLSearchParams();
  params.set("marca_moto", m.marca);
  if (m.modelo) params.set("modelo_moto", m.modelo);
  if (m.anio) params.set("anio", m.anio);
  return `/mi-moto?${params.toString()}`;
}

export function nombreMoto(m: MiMoto): string {
  return [m.marca, m.modelo, m.anio].filter(Boolean).join(" ");
}
