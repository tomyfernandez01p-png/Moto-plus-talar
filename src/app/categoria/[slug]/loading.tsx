import { Skeleton, ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function LoadingCategoria() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <ProductGridSkeleton />
    </div>
  );
}
