/**
 * Recuerda en este navegador los pedidos que hizo el cliente (solo sus ids),
 * para que pueda ver "Mis pedidos" aunque haya comprado sin iniciar sesión.
 * El id del pedido es un UUID imposible de adivinar: conocerlo es la
 * credencial para ver ese pedido (igual que el link de confirmación).
 */
const CLAVE = "mpt_pedidos_v1";
const MAX = 30;

export function leerPedidosLocales(): string[] {
  try {
    const raw = window.localStorage.getItem(CLAVE);
    const lista = raw ? JSON.parse(raw) : [];
    return Array.isArray(lista) ? lista.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function guardarPedidoLocal(id: string) {
  try {
    const actuales = leerPedidosLocales().filter((x) => x !== id);
    window.localStorage.setItem(CLAVE, JSON.stringify([id, ...actuales].slice(0, MAX)));
  } catch {
    // sin localStorage (modo privado): el pedido igual queda guardado en el sistema
  }
}
