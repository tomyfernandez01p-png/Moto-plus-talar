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
