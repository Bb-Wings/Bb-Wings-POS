'use client'
/**
 * @fileoverview Query Provider — BB Wings Management System
 * @description Proveedor de TanStack React Query con configuración de producción.
 * Configura staleTime, retry logic y devtools.
 * @version 1.0.0
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

// ─── Provider ─────────────────────────────────────────────────────────────

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Crear el QueryClient dentro del componente para evitar compartir estado
  // entre request en server-side rendering
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo antes de que los datos se consideren stale
            staleTime: 30 * 1000, // 30 segundos
            // Tiempo en caché después de que el componente se desmonta
            gcTime: 5 * 60 * 1000, // 5 minutos
            // Número de reintentos en caso de error
            retry: (failureCount, error) => {
              // No reintentar en errores 4xx (excepto 429)
              if (
                error instanceof Error &&
                "status" in error &&
                typeof error.status === "number"
              ) {
                if (error.status >= 400 && error.status < 500 && error.status !== 429) {
                  return false;
                }
              }
              return failureCount < 2;
            },
            // Tiempo entre reintentos (exponential backoff)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Revalidar al recuperar el foco de la ventana
            refetchOnWindowFocus: false,
            // No revalidar en reconexión automáticamente
            refetchOnReconnect: "always",
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}
