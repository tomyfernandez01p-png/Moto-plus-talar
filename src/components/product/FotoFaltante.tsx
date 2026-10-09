import { cn } from "@/lib/utils";

/**
 * Estado temporal y discreto para un producto que todavía no tiene
 * fotografía real cargada. Deliberadamente NO simula una foto ni un ícono
 * del producto: solo avisa, sin llamar la atención, que la imagen todavía
 * no está.
 */
export function FotoFaltante({ className, compacto }: { className?: string; compacto?: boolean }) {
  return (
    <div
      role="img"
      aria-label="Foto del producto todavía no disponible"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1 bg-base-dark text-center",
        className
      )}
    >
      <span className="h-px w-8 bg-brand-orange/50" aria-hidden />
      <span className={cn("font-medium text-base-muted", compacto ? "text-[10px]" : "text-xs")}>
        Foto próximamente
      </span>
    </div>
  );
}
