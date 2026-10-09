"use client";

import Image from "next/image";
import { useState } from "react";
import { isDataUrl, esFotoReal } from "@/lib/utils";
import { FotoFaltante } from "@/components/product/FotoFaltante";

interface Imagen {
  url: string;
  alt_text: string | null;
}

export function ProductGallery({
  imagenes,
  nombre,
}: {
  imagenes: Imagen[];
  nombre: string;
}) {
  const [activa, setActiva] = useState(0);
  // Los SVG genéricos de los productos demo no son fotos: se descartan y,
  // si no queda ninguna foto real, se muestra el estado "foto próximamente".
  const lista = imagenes.filter((img) => esFotoReal(img.url));

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative aspect-square overflow-hidden rounded-2xl border border-base-border ${
          lista.length > 0 ? "bg-white" : "bg-base-dark"
        }`}
      >
        {lista[activa]?.url ? (
          <Image
            src={lista[activa].url}
            alt={lista[activa].alt_text || nombre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={isDataUrl(lista[activa].url)}
            className="object-contain p-4"
            priority
          />
        ) : (
          <FotoFaltante />
        )}
      </div>
      {lista.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {lista.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white ${
                i === activa ? "border-brand-orange" : "border-base-border"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={img.alt_text || nombre}
                  fill
                  unoptimized={isDataUrl(img.url)}
                  className="object-contain p-1"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
