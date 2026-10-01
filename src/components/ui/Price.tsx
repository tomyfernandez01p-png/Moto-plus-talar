import { formatPrecio } from "@/lib/format";

export function Price({
  precio,
  precioAnterior,
  size = "md",
}: {
  precio: number;
  precioAnterior?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };
  const tieneDescuento = !!precioAnterior && precioAnterior > precio;
  const porcentajeOff = tieneDescuento
    ? Math.round((1 - precio / precioAnterior!) * 100)
    : 0;

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className={`font-bold text-base-white ${sizes[size]}`}>{formatPrecio(precio)}</span>
      {tieneDescuento && (
        <>
          <span className="text-sm text-base-muted line-through">
            {formatPrecio(precioAnterior!)}
          </span>
          {porcentajeOff > 0 && (
            <span className="rounded-full bg-brand-orange/15 px-1.5 py-0.5 text-xs font-bold text-brand-orange">
              -{porcentajeOff}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
