/**
 * @fileoverview Button Component — BB Wings Management System
 * @description Componente de botón reutilizable con variantes, tamaños,
 * estados de carga y soporte para íconos. Basado en class-variance-authority.
 * @version 1.0.0
 */

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Variants ─────────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base classes aplicadas a todas las variantes
  [
    "inline-flex items-center justify-center gap-2",
    "font-semibold font-ui rounded-lg",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "select-none whitespace-nowrap",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        // Primario — Rojo corporativo
        primary: [
          "bg-primary text-white",
          "hover:bg-primary-600 hover:shadow-glow-primary",
          "focus-visible:ring-primary",
          "shadow-sm",
        ],
        // Secundario — Gold
        secondary: [
          "bg-secondary text-dark",
          "hover:bg-secondary-600 hover:shadow-glow-secondary",
          "focus-visible:ring-secondary",
          "shadow-sm font-bold",
        ],
        // Outline — Borde primario
        outline: [
          "border border-primary/50 text-primary bg-transparent",
          "hover:bg-primary/10 hover:border-primary",
          "focus-visible:ring-primary",
        ],
        // Ghost — Sin fondo
        ghost: [
          "text-gray-muted bg-transparent",
          "hover:bg-white/5 hover:text-white",
          "focus-visible:ring-white/20",
        ],
        // Destructive — Danger
        destructive: [
          "bg-danger text-white",
          "hover:bg-danger/80",
          "focus-visible:ring-danger",
        ],
        // Glass — Glassmorphism
        glass: [
          "glass text-white border-white/10",
          "hover:bg-white/10 hover:border-white/20",
          "focus-visible:ring-white/20",
        ],
        // Link — Solo texto
        link: [
          "text-primary underline-offset-4 hover:underline",
          "focus-visible:ring-primary",
          "h-auto px-0",
        ],
      },
      size: {
        xs:  "h-7  px-2.5 text-xs   rounded-md",
        sm:  "h-8  px-3   text-sm   rounded-lg",
        md:  "h-10 px-4   text-sm",
        lg:  "h-11 px-5   text-base rounded-xl",
        xl:  "h-13 px-7   text-lg   rounded-xl",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-11 w-11 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

// ─── Props ────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Muestra un spinner y deshabilita el botón */
  isLoading?: boolean;
  /** Texto a mostrar mientras isLoading es true */
  loadingText?: string;
  /** Ícono a mostrar a la izquierda del texto */
  leftIcon?: React.ReactNode;
  /** Ícono a mostrar a la derecha del texto */
  rightIcon?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled === true || isLoading;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ─── Export Variants ──────────────────────────────────────────────────────

export { buttonVariants };
