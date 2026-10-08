import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

// Pedido del usuario: sacar el naranja sólido ("feo") del botón principal.
// Ahora es oscuro (misma familia bg-base-* que el resto del sitio) con el
// naranja como detalle -- borde + resplandor -- en vez de protagonista.
// `outline` (abajo) ya cubre el caso "borde naranja", así que `primary`
// queda claramente distinto: fondo sólido oscuro, más jerarquía visual.
const variantClasses: Record<Variant, string> = {
  primary:
    "border border-brand-orange/70 bg-base-black text-base-white shadow-glow-sm hover:border-brand-orange hover:bg-base-dark hover:shadow-glow active:border-brand-orange active:shadow-none",
  secondary: "bg-base-surface text-base-white hover:bg-base-border border border-base-border",
  ghost: "bg-transparent text-base-white hover:bg-base-surface",
  outline: "bg-transparent border border-brand-orange text-brand-orange hover:bg-brand-orange/10",
};

// Un poco más grandes en los 3 tamaños (pedido del usuario).
const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2 rounded-lg",
  md: "text-base px-5 py-3 rounded-xl",
  lg: "text-lg px-7 py-4 rounded-xl",
};

// `active:scale-95` (antes 0.98, casi imperceptible) para que el "efecto de
// apretado" se note de verdad al tocar/clickear.
const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none active:scale-95";

interface ButtonOwnProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type ButtonAsButton = ButtonOwnProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = ButtonOwnProps & { href: string } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >;

export const Button = forwardRef<HTMLButtonElement, ButtonAsButton>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonAsLink) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
