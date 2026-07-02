/**
 * @fileoverview Axios Instance — BB Wings Management System
 * @description Instancia configurada de Axios para comunicación con el backend
 * C++ (Drogon). Incluye interceptores para JWT, refresh automático de tokens,
 * manejo de errores y logging.
 * @version 1.0.0
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, ApiError } from "@/types/api.types";

// ─── Constants ────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
const API_TIMEOUT = 30_000; // 30 segundos

// ─── Token Management ──────────────────────────────────────────────────────

const TOKEN_KEY = "bb_wings_access_token";
const REFRESH_TOKEN_KEY = "bb_wings_refresh_token";

export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── Axios Instance ────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client": "bb-wings-web",
    "X-Client-Version": process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
  },
  withCredentials: true,
});

// ─── Request Interceptor — JWT Injection ──────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenManager.getAccessToken();
    if (token !== null && config.headers !== undefined) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Anti-CSRF token para mutaciones
    if (
      typeof window !== "undefined" &&
      ["post", "put", "patch", "delete"].includes(
        config.method?.toLowerCase() ?? ""
      )
    ) {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];

      if (csrfToken !== undefined && config.headers !== undefined) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// ─── Flag para evitar múltiples refresh simultáneos ───────────────────────

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onRefreshComplete(newToken: string): void {
  refreshSubscribers.forEach((callback) => { callback(newToken); });
  refreshSubscribers = [];
}

// ─── Response Interceptor — Error Handling & Token Refresh ───────────────

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ─── 401: Token expirado — intentar refresh ────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenManager.getRefreshToken();

      if (refreshToken === null) {
        // No hay refresh token — limpiar sesión y redirigir
        tokenManager.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Hay un refresh en progreso — esperar su resultado
        return new Promise<AxiosResponse>((resolve) => {
          subscribeToTokenRefresh((newToken: string) => {
            if (originalRequest.headers !== undefined) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        const { accessToken, refreshToken: newRefreshToken } = data.data;
        tokenManager.setTokens(accessToken, newRefreshToken);

        if (originalRequest.headers !== undefined) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        onRefreshComplete(accessToken);
        return api(originalRequest);
      } catch {
        // Refresh fallido — limpiar sesión
        tokenManager.clearTokens();
        refreshSubscribers = [];
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // ─── 403: Sin permisos ─────────────────────────────────────────────
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        window.location.href = "/unauthorized";
      }
    }

    // ─── 429: Rate limit ───────────────────────────────────────────────
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"] ?? "60";
      console.warn(
        `[BB Wings API] Rate limit alcanzado. Reintentar en ${retryAfter}s`
      );
    }

    return Promise.reject(error);
  }
);

// ─── Typed API Methods ─────────────────────────────────────────────────────

/**
 * Helper tipado para solicitudes GET
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

/**
 * Helper tipado para solicitudes POST
 */
export async function apiPost<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Helper tipado para solicitudes PUT
 */
export async function apiPut<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Helper tipado para solicitudes PATCH
 */
export async function apiPatch<T, D = unknown>(
  url: string,
  data?: D,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

/**
 * Helper tipado para solicitudes DELETE
 */
export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

/**
 * Extrae el mensaje de error de una respuesta de Axios
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.error?.message !== undefined) {
      return data.error.message;
    }
    if (error.response?.status === 404) return "Recurso no encontrado.";
    if (error.response?.status === 429) return "Demasiadas solicitudes. Intenta más tarde.";
    if (error.response?.status === 500) return "Error interno del servidor.";
    if (error.code === "ECONNABORTED") return "La solicitud tardó demasiado. Verifica tu conexión.";
  }
  return "Ocurrió un error inesperado.";
}

export default api;
