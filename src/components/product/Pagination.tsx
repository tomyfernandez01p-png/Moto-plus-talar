import Link from "next/link";

export function Pagination({
  pagina,
  total,
  porPagina,
  basePath,
  searchParams,
}: {
  pagina: number;
  total: number;
  porPagina: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  if (totalPaginas <= 1) return null;

  function hrefPara(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== "pagina") params.set(k, v);
    });
    params.set("pagina", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Paginación">
      <Link
        href={hrefPara(Math.max(1, pagina - 1))}
        aria-disabled={pagina <= 1}
        className={`rounded-lg border border-base-border px-3 py-2 text-sm ${
          pagina <= 1 ? "pointer-events-none opacity-40" : "text-base-white hover:bg-base-surface"
        }`}
      >
        Anterior
      </Link>
      <span className="text-sm text-base-muted">
        Página {pagina} de {totalPaginas}
      </span>
      <Link
        href={hrefPara(Math.min(totalPaginas, pagina + 1))}
        aria-disabled={pagina >= totalPaginas}
        className={`rounded-lg border border-base-border px-3 py-2 text-sm ${
          pagina >= totalPaginas ? "pointer-events-none opacity-40" : "text-base-white hover:bg-base-surface"
        }`}
      >
        Siguiente
      </Link>
    </nav>
  );
}
