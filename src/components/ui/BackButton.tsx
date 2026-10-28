"use client";

import { useRouter } from "next/navigation";

/**
 * Vuelve a la pantalla anterior (listado, búsqueda, categoría) en el mismo
 * punto donde estabas. Si se entró directo al producto (sin historial),
 * cae a la página de productos en vez de no hacer nada.
 */
export function BackButton({ fallbackHref = "/productos" }: { fallbackHref?: string }) {
  const router = useRouter();

  function volver() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={volver}
      className="focus-ring mb-4 inline-flex items-center gap-2 rounded-xl border border-base-border bg-base-dark px-3.5 py-2 text-sm font-semibold text-base-white transition-colors duration-200 hover:border-brand-orange hover:text-brand-orange"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M11 6l-6 6 6 6" />
      </svg>
      Volver
    </button>
  );
}
