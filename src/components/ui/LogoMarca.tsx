import Image from "next/image";
import { cn, isDataUrl, logoChipClass } from "@/lib/utils";

/**
 * Logo de una marca dentro de un recuadro de tamaño fijo, igual para todas:
 * el logo se ajusta adentro sin deformarse (object-contain) y con el mismo
 * margen interno, así ninguna se ve más grande o más chica que otra por su
 * proporción. Mismo borde sutil en todas; el fondo de apoyo (claro/oscuro)
 * sigue saliendo del sufijo del archivo, igual que antes.
 */
export function LogoMarca({ url, className }: { url: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative h-14 overflow-hidden rounded-lg ring-1 ring-white/10 md:h-16",
        logoChipClass(url),
        className,
      )}
    >
      <Image
        src={url}
        alt=""
        fill
        sizes="(min-width: 768px) 144px, 128px"
        quality={95}
        unoptimized={isDataUrl(url)}
        className="object-contain !p-2.5"
      />
    </div>
  );
}
