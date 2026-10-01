import { cn } from "@/lib/utils";

type Tono = "orange" | "neutral" | "success" | "danger";

const tonos: Record<Tono, string> = {
  orange: "bg-brand-orange text-white",
  neutral: "bg-base-surface text-base-white border border-base-border",
  success: "bg-emerald-600 text-white",
  danger: "bg-red-600 text-white",
};

export function Badge({
  children,
  tono = "neutral",
  className,
}: {
  children: React.ReactNode;
  tono?: Tono;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
        tonos[tono],
        className
      )}
    >
      {children}
    </span>
  );
}
