import type { Metadata } from "next";
import { getConfiguracion } from "@/lib/config.server";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function CheckoutPage() {
  const config = await getConfiguracion();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Finalizar compra</h1>
      <CheckoutForm config={config} />
    </div>
  );
}
