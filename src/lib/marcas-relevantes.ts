/**
 * Marcas que se muestran en la tira del inicio (elegidas por el dueño). Las
 * demás marcas siguen existiendo en la base y en sus páginas, solo no van en
 * esta tira. Se muestran en este orden.
 */
export const MARCAS_RELEVANTES = [
  "bajaj",
  "stallion",
  "motul",
  "jarama",
  "hellux",
  "castrol",
  "gulf",
  "ama",
  "mahle",
  "kemparts",
] as const;

export function ordenarMarcasRelevantes<T extends { slug: string }>(marcas: T[]): T[] {
  const idx = (slug: string) => (MARCAS_RELEVANTES as readonly string[]).indexOf(slug);
  return [...marcas].sort((a, b) => idx(a.slug) - idx(b.slug));
}
