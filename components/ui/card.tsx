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
  const iconColorValues = {
    primary:   { bg: "rgba(234, 88, 12, 0.12)", border: "rgba(234, 88, 12, 0.25)", color: "#ea580c" },
    secondary: { bg: "rgba(168, 85, 247, 0.12)", border: "rgba(168, 85, 247, 0.25)", color: "#a855f7" },
    success:   { bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)", color: "#22c55e" },
    warning:   { bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.25)", color: "#eab308" },
    danger:    { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)", color: "#ef4444" },
  };

  const styleColors = iconColorValues[iconColor] || iconColorValues.primary;
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
      className={className}
    >
      {/* Background glow orb */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${styleColors.color}15 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: "6px 0 0", lineHeight: 1.1, fontFamily: "var(--font-heading, inherit)" }}>
          {value}
        </p>
        
        {change !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: isPositive ? "#22c55e" : isNegative ? "#ef4444" : "rgba(255,255,255,0.4)",
                background: isPositive ? "rgba(34,197,94,0.08)" : isNegative ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: "6px",
                border: isPositive ? "1px solid rgba(34,197,94,0.15)" : isNegative ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {isPositive && "+"}
              {change.toFixed(1)}%
            </span>
            {changeLabel !== undefined && (
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>
                {changeLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {icon !== undefined && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: styleColors.bg,
            border: `1px solid ${styleColors.border}`,
            color: styleColors.color,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            boxShadow: `0 4px 12px ${styleColors.color}15`,
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
