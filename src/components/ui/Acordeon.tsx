import type { ReactNode } from "react";

/**
 * Bloque desplegable (nativo <details>, funciona sin JS): título en negrita
 * con flecha que gira al abrir.
 */
export function Acordeon({
  titulo,
  children,
  abierto = false,
}: {
  titulo: string;
  children: ReactNode;
  abierto?: boolean;
}) {
  return (
    <details open={abierto} className="group overflow-hidden rounded-2xl border border-base-border bg-base-dark">
      <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-base font-bold text-base-white marker:hidden [&::-webkit-details-marker]:hidden">
        {titulo}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-brand-orange transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="border-t border-base-border px-5 py-4">{children}</div>
    </details>
  );
}
