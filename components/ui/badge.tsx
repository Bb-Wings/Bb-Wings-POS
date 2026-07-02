/**
 * @fileoverview Badge Component — BB Wings Management System
 * @description Componente badge/chip para estados, etiquetas y contadores.
 * @version 1.0.0
 */

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// ─── Variants ─────────────────────────────────────────────────────────────

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-medium font-ui rounded-full border transition-colors",
  {
    variants: {
      variant: {
        default:   "bg-card border-card-border text-gray",
        primary:   "bg-primary/10 border-primary/20 text-primary",
        secondary: "bg-secondary/10 border-secondary/20 text-secondary",
        success:   "bg-success/10 border-success/20 text-success",
        warning:   "bg-warning/10 border-warning/20 text-warning",
        danger:    "bg-danger/10 border-danger/20 text-danger",
        outline:   "bg-transparent border-current text-gray",
        solid: {
          // se combina con color
        },
      },
      size: {
        sm:  "text-[10px] px-2   py-0.5",
        md:  "text-xs    px-2.5 py-1",
        lg:  "text-sm    px-3   py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Punto de estado a la izquierda */
  dot?: boolean;
  dotColor?: "success" | "warning" | "danger" | "primary";
}

export function Badge({
  className,
  variant,
  size,
  dot,
  dotColor = "success",
  children,
  ...props
}: BadgeProps) {
  const dotColors = {
    success: "bg-success",
    warning: "bg-warning",
    danger:  "bg-danger",
    primary: "bg-primary",
  };

  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {dot === true && (
        <span
          className={cn(
            "flex-shrink-0 rounded-full",
            size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
            dotColors[dotColor]
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

// ─── Order Status Badge ────────────────────────────────────────────────────

const orderStatusConfig = {
  pendiente:   { variant: "warning",   label: "Pendiente",   dot: true, dotColor: "warning" },
  confirmado:  { variant: "primary",   label: "Confirmado",  dot: true, dotColor: "primary" },
  preparando:  { variant: "secondary", label: "Preparando",  dot: true, dotColor: "warning" },
  listo:       { variant: "success",   label: "Listo",       dot: true, dotColor: "success" },
  entregado:   { variant: "default",   label: "Entregado",   dot: false },
  cancelado:   { variant: "danger",    label: "Cancelado",   dot: true, dotColor: "danger" },
} as const;

export function OrderStatusBadge({
  status,
  size = "md",
}: {
  status: keyof typeof orderStatusConfig;
  size?: "sm" | "md" | "lg";
}) {
  const config = orderStatusConfig[status];
  return (
    <Badge
      variant={config.variant as BadgeProps["variant"]}
      size={size}
      dot={config.dot}
      dotColor={("dotColor" in config ? config.dotColor : undefined) as BadgeProps["dotColor"]}
    >
      {config.label}
    </Badge>
  );
}

// ─── Loyalty Level Badge ───────────────────────────────────────────────────

const loyaltyConfig = {
  bronce:  { className: "bg-amber-900/20 border-amber-700/30 text-amber-500",  label: "Bronce"  },
  plata:   { className: "bg-gray-500/10 border-gray-400/30 text-gray-300",    label: "Plata"   },
  oro:     { className: "bg-yellow-500/10 border-yellow-400/30 text-yellow-400", label: "Oro"  },
  platino: { className: "bg-cyan-500/10 border-cyan-400/30 text-cyan-400",    label: "Platino" },
} as const;

export function LoyaltyBadge({
  level,
}: {
  level: keyof typeof loyaltyConfig;
}) {
  const config = loyaltyConfig[level];
  return (
    <Badge className={config.className} size="sm">
      ⭐ {config.label}
    </Badge>
  );
}
