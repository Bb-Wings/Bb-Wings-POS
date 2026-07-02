/**
 * @fileoverview UI Store — BB Wings Management System
 * @description Store de Zustand para el estado global de la UI. Maneja sidebar,
 * toasts, modales, loading global y preferencias de usuario.
 * @version 1.0.0
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { UIStore, Toast } from "@/types/store.types";

// ─── Constants ────────────────────────────────────────────────────────────

const DEFAULT_TOAST_DURATION = 5000; // 5 segundos

// ─── Store ────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────
      sidebarOpen: false,
      sidebarCollapsed: false,
      toasts: [],
      modals: [],
      isGlobalLoading: false,
      globalLoadingMessage: null,
      searchQuery: "",
      activeCategoryId: null,

      // ─── Actions ────────────────────────────────────────────────────

      toggleSidebar: () => {
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          "ui/toggleSidebar"
        );
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open }, false, "ui/setSidebarOpen");
      },

      toggleSidebarCollapsed: () => {
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          "ui/toggleSidebarCollapsed"
        );
      },

      addToast: (toast: Omit<Toast, "id">) => {
        const id = uuidv4();
        const duration = toast.duration ?? DEFAULT_TOAST_DURATION;

        set(
          (state) => ({
            toasts: [...state.toasts, { ...toast, id, duration }],
          }),
          false,
          "ui/addToast"
        );

        // Auto-remove después de la duración
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },

      removeToast: (id: string) => {
        set(
          (state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }),
          false,
          "ui/removeToast"
        );
      },

      clearToasts: () => {
        set({ toasts: [] }, false, "ui/clearToasts");
      },

      openModal: (modal) => {
        const id = uuidv4();
        set(
          (state) => ({
            modals: [...state.modals, { ...modal, id }],
          }),
          false,
          "ui/openModal"
        );
        return id;
      },

      closeModal: (id: string) => {
        set(
          (state) => ({
            modals: state.modals.filter((m) => m.id !== id),
          }),
          false,
          "ui/closeModal"
        );
      },

      closeAllModals: () => {
        set({ modals: [] }, false, "ui/closeAllModals");
      },

      setGlobalLoading: (loading: boolean, message?: string) => {
        set(
          {
            isGlobalLoading: loading,
            globalLoadingMessage: loading ? (message ?? null) : null,
          },
          false,
          "ui/setGlobalLoading"
        );
      },

      setSearchQuery: (searchQuery: string) => {
        set({ searchQuery }, false, "ui/setSearchQuery");
      },

      setActiveCategoryId: (activeCategoryId: number | null) => {
        set({ activeCategoryId }, false, "ui/setActiveCategoryId");
      },
    }),
    { name: "UIStore" }
  )
);

// ─── Convenience Toast Helpers ────────────────────────────────────────────

/**
 * Hook para mostrar toasts fácilmente desde cualquier componente
 */
export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);

  return {
    success: (title: string, message: string = "", duration?: number) => {
      addToast({ type: "success", title, message, duration });
    },
    error: (title: string, message: string = "", duration?: number) => {
      addToast({ type: "error", title, message, duration: duration ?? 8000 });
    },
    warning: (title: string, message: string = "", duration?: number) => {
      addToast({ type: "warning", title, message, duration });
    },
    info: (title: string, message: string = "", duration?: number) => {
      addToast({ type: "info", title, message, duration });
    },
    dismiss: (id: string) => {
      removeToast(id);
    },
  };
}

// ─── Selectors ────────────────────────────────────────────────────────────

export const useSidebarOpen = () =>
  useUIStore((state) => state.sidebarOpen);
export const useSidebarCollapsed = () =>
  useUIStore((state) => state.sidebarCollapsed);
export const useToasts = () => useUIStore((state) => state.toasts);
export const useModals = () => useUIStore((state) => state.modals);
export const useIsGlobalLoading = () =>
  useUIStore((state) => state.isGlobalLoading);
export const useSearchQuery = () =>
  useUIStore((state) => state.searchQuery);
export const useActiveCategoryId = () =>
  useUIStore((state) => state.activeCategoryId);
