import { ImportadorCatalogo } from "./ImportadorCatalogo";

export const metadata = { title: "Importar fotos y logos del catálogo" };

export default function ImportarCatalogoPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-base-white">Importar fotos y logos del catálogo</h1>
      <p className="mb-6 text-sm text-base-muted">
        Sube a tu almacenamiento las fotos recuperadas de los catálogos en PDF y los logos de marcas, y
        los vincula a cada producto y marca. Se puede repetir sin duplicar nada. No toca precios, stock ni
        productos con foto cargada a mano.
      </p>
      <ImportadorCatalogo />
    </div>
  );
}
