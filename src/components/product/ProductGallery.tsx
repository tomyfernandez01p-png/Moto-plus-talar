"use client";

import Image from "next/image";
import { useState } from "react";
import { isDataUrl } from "@/lib/utils";

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
  const lista = imagenes.length > 0 ? imagenes : [{ url: "", alt_text: nombre }];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-base-border bg-base-surface">
        {lista[activa]?.url ? (
          <Image
            src={lista[activa].url}
            alt={lista[activa].alt_text || nombre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={isDataUrl(lista[activa].url)}
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-base-muted">Sin imagen</div>
        )}
      </div>
      {lista.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {lista.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
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
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
