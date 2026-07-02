/**
 * @fileoverview Input Component — BB Wings Management System
 * @description Campo de entrada reutilizable con soporte para íconos,
 * etiqueta, mensajes de error y múltiples estados visuales.
 * @version 1.0.0
 */

import { forwardRef, useId } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

// ─── Props ────────────────────────────────────────────────────────────────

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Etiqueta del campo */
  label?: string;
  /** Mensaje de error a mostrar debajo del campo */
  error?: string;
  /** Texto de ayuda debajo del campo */
  hint?: string;
  /** Ícono a la izquierda del campo */
  leftIcon?: React.ReactNode;
  /** Ícono o elemento a la derecha del campo */
  rightElement?: React.ReactNode;
  /** Tamaño del input */
  size?: "sm" | "md" | "lg";
  /** El campo es requerido (muestra asterisco en label) */
  required?: boolean;
  /** Clases adicionales para el wrapper */
  wrapperClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      size = "md",
      required,
      type = "text",
      id: externalId,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const id = externalId ?? internalId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const sizeClasses = {
      sm: cn(
        "h-8 text-sm",
        leftIcon !== undefined ? "pl-9" : "pl-3",
        (rightElement !== undefined || isPassword) ? "pr-9" : "pr-3"
      ),
      md: cn(
        "h-10 text-sm",
        leftIcon !== undefined ? "pl-10" : "pl-3.5",
        (rightElement !== undefined || isPassword) ? "pr-10" : "pr-3.5"
      ),
      lg: cn(
        "h-12 text-base",
        leftIcon !== undefined ? "pl-11" : "pl-4",
        (rightElement !== undefined || isPassword) ? "pr-11" : "pr-4"
      ),
    };

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {/* Label */}
        {label !== undefined && (
          <label
            htmlFor={id}
            className="text-sm font-medium font-ui text-gray-300"
          >
            {label}
            {required === true && (
              <span className="ml-1 text-primary" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon !== undefined && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-muted">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type={inputType}
            disabled={disabled}
            required={required}
            aria-invalid={error !== undefined}
            aria-describedby={
              [error !== undefined && errorId, hint !== undefined && hintId]
                .filter(Boolean)
                .join(" ") || undefined
            }
            className={cn(
              // Base
              "w-full rounded-lg border bg-card text-white",
              "placeholder:text-gray-muted",
              "transition-all duration-200",
              // Border & Focus
              "border-card-border",
              "focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20",
              // Error state
              error !== undefined && "border-danger/50 focus:border-danger focus:ring-danger/20",
              // Disabled state
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Sizing
              sizeClasses[size],
              className
            )}
            {...props}
          />

          {/* Right element / Password toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => { setShowPassword((prev) => !prev); }}
              className="absolute right-3 text-gray-muted hover:text-white transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : rightElement !== undefined ? (
            <div className="absolute right-3 flex items-center text-gray-muted">
              {rightElement}
            </div>
          ) : null}

          {/* Error icon */}
          {error !== undefined && !isPassword && rightElement === undefined && (
            <div className="absolute right-3 text-danger pointer-events-none">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Error message */}
        {error !== undefined && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1 text-xs text-danger font-medium"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Hint message */}
        {hint !== undefined && error === undefined && (
          <p id={hintId} className="text-xs text-gray-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
