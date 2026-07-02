'use client'
/**
 * @fileoverview Supabase Provider — BB Wings Management System
 * @description Proveedor de contexto para el cliente de Supabase del navegador.
 * Sincroniza el estado de autenticación de Supabase con el store de Zustand.
 * @version 1.0.0
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth.store";
import type { Database } from "@/types/database.types";
import type { AuthUser } from "@/types/store.types";

type PerfilWithRelations = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatar_url?: string | null;
  roles?: { nombre: string } | null;
  clientes?: { id: number; puntos_acumulados: number; nivel_fidelidad: string } | null;
};

// ─── Context ──────────────────────────────────────────────────────────────

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const { setUser, setTokens, logout } = useAuthStore();

  useEffect(() => {

    // ── Sincronizar sesión inicial ──────────────────────────────────────────
    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Obtener perfil del usuario
          const { data: perfil } = await supabase
            .from("usuarios")
            .select(`
              *,
              roles (nombre),
              clientes (id, puntos_acumulados, nivel_fidelidad)
            `)
            .eq("id", session.user.id)
            .single();

          const perfilTyped = perfil as unknown as PerfilWithRelations;
          if (perfilTyped) {
            const rolData = perfilTyped.roles;
            const rolNombre = rolData && typeof rolData === "object" && !Array.isArray(rolData)
              ? (rolData as { nombre: string }).nombre
              : "cliente";

            const clienteData = perfilTyped.clientes;
            const cliente = clienteData && typeof clienteData === "object" && !Array.isArray(clienteData)
              ? (clienteData as { id: number; puntos_acumulados: number; nivel_fidelidad: string })
              : null;

            const authUser: AuthUser = {
              id: perfilTyped.id,
              email: perfilTyped.email,
              nombre: perfilTyped.nombre,
              apellido: perfilTyped.apellido,
              rol: rolNombre as AuthUser["rol"],
              avatarUrl: perfilTyped.avatar_url ?? null,
              clienteId: cliente?.id ?? null,
              empleadoId: null,
              puntos: cliente?.puntos_acumulados ?? 0,
              nivelFidelidad: (cliente?.nivel_fidelidad ?? "bronce") as AuthUser["nivelFidelidad"],
            };

            setUser(authUser);
            setTokens(session.access_token, session.refresh_token ?? "");
            return;
          }
        }
      } catch {
        // Ignorar error de red y usar fallback de Server Action
      }

      // Fallback: Sincronizar usando la Server Action getSession (que soporta tanto Supabase real como Mock local)
      try {
        const { getSession } = await import("@/lib/actions/auth.actions");
        const sessionData = await getSession();
        if (sessionData && sessionData.perfil) {
          const perfilTyped = sessionData.perfil as unknown as PerfilWithRelations;
          const rolData = perfilTyped.roles;
          const rolNombre = rolData && typeof rolData === "object" && !Array.isArray(rolData)
            ? (rolData as { nombre: string }).nombre
            : "cliente";

          const authUser: AuthUser = {
            id: perfilTyped.id,
            email: perfilTyped.email,
            nombre: perfilTyped.nombre,
            apellido: perfilTyped.apellido,
            rol: rolNombre as AuthUser["rol"],
            avatarUrl: perfilTyped.avatar_url ?? null,
            clienteId: null,
            empleadoId: null,
            puntos: 0,
            nivelFidelidad: "bronce",
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    void syncSession();

    // ── Escuchar cambios de autenticación ─────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session) {
          // Re-sincronizar al iniciar sesión
          await syncSession();
        }

        if (event === "SIGNED_OUT") {
          logout();
        }

        if (event === "TOKEN_REFRESHED" && session) {
          setTokens(session.access_token, session.refresh_token ?? "");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setTokens, logout, supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

/**
 * Hook para acceder al cliente de Supabase en Client Components.
 *
 * @example
 * ```tsx
 * 'use client'
 * const { supabase } = useSupabase()
 * const { data } = await supabase.from('productos').select('*')
 * ```
 */
export function useSupabase() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase debe usarse dentro de <SupabaseProvider>");
  }
  return context;
}
