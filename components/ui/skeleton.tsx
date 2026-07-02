/**
 * @fileoverview Skeleton Component — BB Wings Management System
 * @description Placeholders de carga con efecto shimmer para estados de loading.
 * @version 1.0.0
 */

import { cn } from "@/lib/utils/cn";

// ─── Base Skeleton ────────────────────────────────────────────────────────

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer rounded-lg", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-card-border p-5 space-y-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// ─── Product Card Skeleton ─────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-card-border overflow-hidden" aria-hidden="true">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Table Row Skeleton ────────────────────────────────────────────────────

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-card-border" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ opacity: 1 - i * 0.1 }}
        />
      ))}
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-card-border p-5" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
      </div>
    </div>
  );
}

// ─── Kitchen Card Skeleton ────────────────────────────────────────────────

export function KitchenCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-card-border p-4 space-y-3" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}
