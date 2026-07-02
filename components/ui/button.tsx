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

    const getInlineStyle = () => {
      const baseStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontWeight: "600",
        borderRadius: "0.5rem",
        transition: "all 0.2s ease-out",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        whiteSpace: "nowrap",
        userSelect: "none",
        border: "1px solid transparent",
      };

      if (variant === "primary" || !variant) {
        baseStyle.backgroundColor = "#D61F2C";
        baseStyle.color = "#ffffff";
      } else if (variant === "secondary") {
        baseStyle.backgroundColor = "#F4B400";
        baseStyle.color = "#101010";
      } else if (variant === "outline") {
        baseStyle.border = "1px solid rgba(214, 31, 44, 0.5)";
        baseStyle.color = "#D61F2C";
        baseStyle.backgroundColor = "transparent";
      } else if (variant === "ghost") {
        baseStyle.backgroundColor = "transparent";
        baseStyle.color = "#9ca3af";
      } else if (variant === "destructive") {
        baseStyle.backgroundColor = "#C62828";
        baseStyle.color = "#ffffff";
      } else if (variant === "glass") {
        baseStyle.backgroundColor = "rgba(30, 30, 30, 0.6)";
        baseStyle.backdropFilter = "blur(16px)";
        baseStyle.border = "1px solid rgba(255, 255, 255, 0.1)";
        baseStyle.color = "#ffffff";
      } else if (variant === "link") {
        baseStyle.backgroundColor = "transparent";
        baseStyle.color = "#D61F2C";
        baseStyle.textDecoration = "underline";
      }

      if (size === "xs") {
        baseStyle.height = "1.75rem";
        baseStyle.paddingLeft = "0.625rem";
        baseStyle.paddingRight = "0.625rem";
        baseStyle.fontSize = "0.75rem";
      } else if (size === "sm") {
        baseStyle.height = "2rem";
        baseStyle.paddingLeft = "0.75rem";
        baseStyle.paddingRight = "0.75rem";
        baseStyle.fontSize = "0.875rem";
      } else if (size === "lg") {
        baseStyle.height = "2.75rem";
        baseStyle.paddingLeft = "1.25rem";
        baseStyle.paddingRight = "1.25rem";
        baseStyle.fontSize = "1rem";
      } else if (size === "xl") {
        baseStyle.height = "3.25rem";
        baseStyle.paddingLeft = "1.75rem";
        baseStyle.paddingRight = "1.75rem";
        baseStyle.fontSize = "1.125rem";
      } else if (size === "icon") {
        baseStyle.height = "2.25rem";
        baseStyle.width = "2.25rem";
        baseStyle.padding = "0";
      } else if (size === "icon-sm") {
        baseStyle.height = "2rem";
        baseStyle.width = "2rem";
        baseStyle.padding = "0";
      } else if (size === "icon-lg") {
        baseStyle.height = "2.75rem";
        baseStyle.width = "2.75rem";
        baseStyle.padding = "0";
      } else {
        baseStyle.height = "2.5rem";
        baseStyle.paddingLeft = "1rem";
        baseStyle.paddingRight = "1rem";
        baseStyle.fontSize = "0.875rem";
      }

      if (fullWidth) {
        baseStyle.width = "100%";
      }

      return baseStyle;
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        disabled={isDisabled}
        aria-busy={isLoading}
        style={{ ...getInlineStyle(), ...props.style }}
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
