/**
 * @fileoverview Modal Component — BB Wings Management System
 * @description Modal/Dialog accesible con animaciones Framer Motion,
 * cierre en backdrop click, soporte para scroll interno y tamaños múltiples.
 * @version 1.0.0
 */

'use client'

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Props ────────────────────────────────────────────────────────────────

export interface ModalProps {
  /** Controla la visibilidad del modal */
  isOpen: boolean;
  /** Función llamada cuando se solicita cerrar el modal */
  onClose: () => void;
  /** Título del modal */
  title?: string;
  /** Descripción bajo el título */
  description?: string;
  /** Tamaño del modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Si true, el modal no se puede cerrar haciendo click en el backdrop */
  preventClose?: boolean;
  /** Clases adicionales para el contenedor del modal */
  className?: string;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Pie del modal */
  footer?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  preventClose = false,
  className,
  children,
  footer,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Trap focus and handle Escape key ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Bloquear scroll del body
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, preventClose, onClose]);

  const sizeClasses = {
    sm:   "max-w-sm",
    md:   "max-w-md",
    lg:   "max-w-lg",
    xl:   "max-w-2xl",
    full: "max-w-5xl w-full",
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!preventClose && e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          aria-describedby={description ? "modal-description" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal panel */}
          <motion.div
            key="panel"
            className={cn(
              "relative w-full z-10",
              "bg-card border border-card-border rounded-2xl",
              "shadow-2xl shadow-black/60",
              "max-h-[90vh] flex flex-col",
              sizeClasses[size],
              className
            )}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            {(title !== undefined || !preventClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-card-border flex-shrink-0">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-white font-heading"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-gray-muted"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {!preventClose && (
                  <button
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-muted hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {children}
            </div>

            {/* Footer */}
            {footer !== undefined && (
              <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-4 border-t border-card-border flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
