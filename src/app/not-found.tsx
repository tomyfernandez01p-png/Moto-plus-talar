import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="text-5xl font-extrabold text-brand-orange">404</p>
      <h1 className="mt-3 text-2xl font-bold text-base-white">No encontramos esta página</h1>
      <p className="mt-2 text-sm text-base-muted">
        Puede que el link esté mal escrito o que el producto ya no esté disponible.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/productos">Ver la tienda</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Ir al inicio
        </ButtonLink>
      </div>
    </div>
  );
}
