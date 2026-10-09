import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * next/image optimiza y valida `src` contra `images.remotePatterns`. Una
 * `data:` URI (usada por ejemplo en imágenes placeholder de productos demo)
 * no es un host remoto, así que hay que servirla "tal cual" con `unoptimized`
 * para evitar que el optimizador de imágenes la rechace.
 */
export function isDataUrl(src: string | null | undefined): boolean {
  return typeof src === "string" && src.startsWith("data:");
}

/**
 * ¿Esta URL es una fotografía real del producto? Los 28 productos demo
 * cargados hoy traen un SVG genérico embebido (`data:image/svg+xml...`) que
 * NO es una foto: se trata como "foto faltante" para no hacerle creer al
 * comprador que ese ícono es el producto. Una foto subida desde el admin
 * (Supabase Storage, https://...) sí cuenta como real.
 */
export function esFotoReal(src: string | null | undefined): src is string {
  return typeof src === "string" && src.length > 0 && !src.startsWith("data:image/svg");
}

/**
 * Los logos recortados del catálogo (fondo transparente, colores originales)
 * se guardan con un sufijo en el nombre del archivo según con qué fondo se
 * leen bien: `--oscuro` = logo de trazo oscuro (necesita fondo claro) y
 * `--claro` = logo de trazo claro (necesita fondo oscuro). Los demás se ven
 * bien directo sobre el fondo del sitio. No altera el logo: solo decide el
 * fondo de apoyo.
 */
export function logoFondo(url: string | null | undefined): "claro" | "oscuro" | null {
  if (!url) return null;
  if (url.includes("--oscuro.")) return "claro";
  if (url.includes("--claro.")) return "oscuro";
  return null;
}

export function logoChipClass(url: string | null | undefined): string {
  const f = logoFondo(url);
  if (f === "claro") return "rounded-md bg-neutral-100 [&_img]:p-1.5";
  if (f === "oscuro") return "rounded-md bg-neutral-800 [&_img]:p-1.5";
  return "";
}
