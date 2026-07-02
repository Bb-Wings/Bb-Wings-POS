/**
 * @fileoverview Auth Store — BB Wings Management System
 * @description Store de Zustand para manejo del estado de autenticación.
 * Persiste el estado en localStorage con middleware de persistencia.
 * @version 1.0.0
 */

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { AuthStore, AuthUser } from "@/types/store.types";
import { tokenManager } from "@/lib/api/axios";

// ─── Store ────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        // ─── State ────────────────────────────────────────────────────
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,

        // ─── Actions ──────────────────────────────────────────────────

        setUser: (user: AuthUser | null) => {
          set(
            { user, isAuthenticated: user !== null },
            false,
            "auth/setUser"
          );
        },

        setTokens: (accessToken: string, refreshToken: string) => {
          // Sincronizar con el token manager de Axios
          tokenManager.setTokens(accessToken, refreshToken);
          set(
            { accessToken, refreshToken },
            false,
            "auth/setTokens"
          );
        },

        logout: () => {
          // Limpiar tokens de Axios
          tokenManager.clearTokens();
          set(
            {
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              error: null,
            },
            false,
            "auth/logout"
          );
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading }, false, "auth/setLoading");
        },

        setError: (error: string | null) => {
          set({ error, isLoading: false }, false, "auth/setError");
        },

        clearError: () => {
          set({ error: null }, false, "auth/clearError");
        },
      }),
      {
        name: "bb-wings-auth",
        // Solo persistir datos no sensibles
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          // Los tokens se manejan en tokenManager (localStorage directo)
        }),
      }
    ),
    { name: "AuthStore" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export const useIsAdmin = () =>
  useAuthStore(
    (state) =>
      state.user?.rol === "super_admin" || state.user?.rol === "admin"
  );

export const useIsCajero = () =>
  useAuthStore(
    (state) =>
      state.user?.rol === "cajero" ||
      state.user?.rol === "admin" ||
      state.user?.rol === "super_admin"
  );

export const useIsCocinero = () =>
  useAuthStore(
    (state) =>
      state.user?.rol === "cocinero" ||
      state.user?.rol === "admin" ||
      state.user?.rol === "super_admin"
  );

export const useUserRole = () => useAuthStore((state) => state.user?.rol);
export const useUserPuntos = () =>
  useAuthStore((state) => state.user?.puntos ?? 0);
