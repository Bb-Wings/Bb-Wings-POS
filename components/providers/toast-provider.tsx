'use client'
/**
 * @fileoverview Toast Provider — BB Wings Management System
 * @description Sistema de notificaciones toast con animaciones Framer Motion.
 * Se posiciona en la esquina inferior derecha de la pantalla.
 * @version 1.0.0
 */

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { useToasts, useUIStore } from "@/lib/store/ui.store";
import type { Toast, ToastType } from "@/types/store.types";

// ─── Toast Config ──────────────────────────────────────────────────────────

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; bgClass: string; borderClass: string; iconClass: string }
> = {
  success: {
    icon: <CheckCircle className="h-5 w-5" />,
    bgClass: "bg-[#0d2b1a]",
    borderClass: "border-success/30",
    iconClass: "text-success",
  },
  error: {
    icon: <XCircle className="h-5 w-5" />,
    bgClass: "bg-[#2b0d0d]",
    borderClass: "border-danger/30",
    iconClass: "text-danger",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    bgClass: "bg-[#2b1d0d]",
    borderClass: "border-warning/30",
    iconClass: "text-warning",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    bgClass: "bg-[#0d1a2b]",
    borderClass: "border-blue-500/30",
    iconClass: "text-blue-400",
  },
};

// ─── Toast Item ────────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((state) => state.removeToast);
  const config = toastConfig[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`
        relative flex items-start gap-3 w-full max-w-sm p-4 rounded-xl
        border shadow-lg shadow-black/40
        ${config.bgClass} ${config.borderClass}
        glass-strong
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Línea de progreso */}
      {toast.duration !== undefined && toast.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-bl-xl bg-current opacity-30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          style={{ color: config.iconClass.replace("text-", "") }}
        />
      )}

      {/* Ícono */}
      <span className={`flex-shrink-0 mt-0.5 ${config.iconClass}`}>
        {config.icon}
      </span>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white font-ui leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-gray-muted leading-relaxed">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-xs font-semibold text-primary hover:text-primary-400 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Botón de cerrar */}
      <button
        onClick={() => { removeToast(toast.id); }}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 p-1 rounded-lg text-gray-muted hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function ToastProvider() {
  const toasts = useToasts();

  return (
    <div
      aria-label="Notificaciones"
      className="fixed bottom-6 right-6 flex flex-col gap-3 z-[1070] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
