"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch, IconClose } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  autoFocus,
  defaultValue = "",
}: {
  className?: string;
  autoFocus?: boolean;
  /** Precarga el valor sin leer useSearchParams acá (evita el requisito de
      Suspense boundary de Next para ese hook): quien ya conoce el query de
      la URL -- ej. /buscar -- lo pasa como prop. */
  defaultValue?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [enfocado, setEnfocado] = useState(false);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={buscar} className={className}>
      <div
        className={cn(
          "relative w-full transition-shadow duration-200 ease-smooth",
          enfocado && "shadow-glow-sm"
        )}
      >
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-base-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          autoFocus={autoFocus}
          placeholder="Buscá productos, códigos o marcas…"
          aria-label="Buscar productos"
          className="w-full rounded-xl border border-base-border bg-base-dark py-3 pl-11 pr-10 text-sm text-base-white placeholder:text-base-muted transition-colors duration-200 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="focus-ring absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-base-muted hover:bg-base-surface hover:text-base-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
