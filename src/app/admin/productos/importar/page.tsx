import { ImportForm } from "./ImportForm";

export default function ImportarProductosPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-base-white">Importar productos (CSV)</h1>
      <p className="mb-6 text-sm text-base-muted">
        Soporta miles de productos en un mismo archivo. Se valida cada fila antes de importar: las
        filas con errores se listan abajo y no se guardan, el resto se importa igual.
      </p>
      <ImportForm />
    </div>
  );
}
