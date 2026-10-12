import { redirect } from "next/navigation";

// Los pedidos de la cuenta ahora se ven en /mis-pedidos (junto con los que se
// hicieron sin iniciar sesión en este navegador).
export default function MisPedidosCuentaPage() {
  redirect("/mis-pedidos");
}
