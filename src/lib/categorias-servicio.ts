/**
 * Tarjetas de "categoría" que en realidad son un servicio (no un producto):
 * no viven en la tabla `categorias` porque no son algo que se vende, sino
 * algo que se hace. Se agregan a mano a la lista de categorías reales en
 * la Home, /categorias y el carrusel, con su propio `href` (ver
 * CategoriasGrid.tsx / CategoryCarousel.tsx).
 */
export const CATEGORIAS_SERVICIO = [
  {
    nombre: "Mecánica",
    slug: "mecanica",
    imagen_url: null,
    href: "/mecanica",
  },
] as const;
