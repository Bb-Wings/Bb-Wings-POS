/**
 * @fileoverview Card Component — BB Wings Management System
 * @description Componente card reutilizable con variantes de glassmorphism,
 * soporte para header, footer y diferentes estilos visuales.
 * @version 1.0.0
 */

import { cn } from "@/lib/utils/cn";

// ─── Card Root ─────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "bordered" | "flat";
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  className,
  variant = "default",
  hoverable = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default:  "bg-card border border-card-border",
    glass:    "glass border border-white/5",
    elevated: "bg-card border border-card-border shadow-card",
    bordered: "bg-transparent border border-card-border/60",
    flat:     "bg-[#161616] border-none",
  };

  const paddingClasses = {
    none: "",
    sm:   "p-3",
    md:   "p-5",
    lg:   "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && "cursor-pointer transition-all duration-250 hover:border-white/10 hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-4 border-b border-card-border",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {title !== undefined && (
          <h3 className="text-base font-semibold text-white font-ui leading-tight truncate">
            {title}
          </h3>
        )}
        {description !== undefined && (
          <p className="mt-1 text-sm text-gray-muted leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </div>
      {action !== undefined && (
        <div className="flex-shrink-0">{action}</div>
      )}
    </div>
  );
}

// ─── Card Content ──────────────────────────────────────────────────────────

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}

// ─── Card Footer ──────────────────────────────────────────────────────────

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "pt-4 border-t border-card-border flex items-center justify-end gap-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  iconColor?: "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor = "primary",
  className,
}: StatCardProps) {
  const iconBgColors = {
    primary:   "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    success:   "bg-success/10 text-success",
    warning:   "bg-warning/10 text-warning",
    danger:    "bg-danger/10 text-danger",
  };

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className={cn("glass-card", className)} padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-muted font-ui">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white font-heading truncate">
            {value}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-semibold",
                  isPositive && "text-success",
                  isNegative && "text-danger",
                  !isPositive && !isNegative && "text-gray-muted"
                )}
              >
                {isPositive && "+"}
                {change.toFixed(1)}%
              </span>
              {changeLabel !== undefined && (
                <span className="text-xs text-gray-muted">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {icon !== undefined && (
          <div
            className={cn(
              "flex-shrink-0 p-3 rounded-xl",
              iconBgColors[iconColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
