/**
 * Devuelve una ruta interna segura para redirigir después del login. Solo se
 * aceptan rutas que empiezan con una sola "/" (nada de "//sitio.com",
 * "/\sitio.com" ni URLs absolutas), para evitar redirecciones abiertas hacia
 * sitios externos.
 */
export function rutaSegura(destino: string | null | undefined, porDefecto: string): string {
  if (!destino) return porDefecto;
  if (!destino.startsWith("/") || destino.startsWith("//") || destino.startsWith("/\\")) return porDefecto;
  if (/[\u0000-\u001f]/.test(destino)) return porDefecto;
  return destino;
}
