import { cn } from "@/lib/utils";

/** Bloque base de skeleton (shimmer) para estados de carga. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

/** Grilla de tarjetas de producto en estado de carga, misma grilla que ProductGrid. */
export function ProductGridSkeleton({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-base-border bg-base-surface">
          <Skeleton className="aspect-square rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-1 h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
