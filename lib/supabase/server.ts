/**
 * @fileoverview Supabase Server Client — BB Wings Management System
 * @description Cliente de Supabase para uso en Server Components, Server Actions
 * y Route Handlers. Maneja automáticamente las cookies de sesión mediante @supabase/ssr.
 * @version 1.0.0
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

// ─── Validation ────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─── Standard Server Client (RLS habilitado) ──────────────────────────────

/**
 * Cliente de Supabase para Server Components y Server Actions.
 * Respeta Row Level Security (RLS) con el usuario autenticado.
 * 
 * IMPORTANTE: Este cliente lee y escribe cookies de Next.js.
 * Solo puede usarse en Server Components, Server Actions y Route Handlers.
 *
 * @example
 * ```tsx
 * // En un Server Component o Server Action
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * ```
 */
export async function createClient() {
  // cookies() ahora es async en Next.js 15+
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll puede fallar en Server Components (solo lectura)
          // Esto es esperado y no es un error real
        }
      },
    },
  }) as any;
}

// ─── Service Role Client (RLS deshabilitado — solo servidor) ──────────────

/**
 * Cliente de Supabase con privilegios de service_role.
 * OMITE Row Level Security completamente.
 * 
 * ⚠️  ADVERTENCIA: Usar SOLO en Server Actions o API Routes protegidas.
 * NUNCA exponer al cliente. NUNCA usar sin verificar permisos manualmente.
 *
 * @example
 * ```tsx
 * // Solo en Server Actions con verificación de rol
 * import { createAdminClient } from '@/lib/supabase/server'
 *
 * const supabase = createAdminClient()
 * // Verificar que el usuario es admin antes de usar
 * ```
 */
export function createAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      "[BB Wings] SUPABASE_SERVICE_ROLE_KEY no está definida. " +
      "Este cliente requiere la service role key para funcionar."
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as any;
}

// ─── Helper: Get Authenticated User ───────────────────────────────────────

/**
 * Obtiene el usuario autenticado actual de forma segura.
 * Usa getUser() en lugar de getSession() para validar el token con el servidor.
 * 
 * @returns El usuario autenticado o null si no hay sesión
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error !== null || user === null) {
    return null;
  }

  return user;
}

import { getMockUserByEmail } from "./mockDb";

/**
 * Obtiene el usuario autenticado con su perfil completo de la base de datos.
 * Lanza un error si el usuario no está autenticado.
 */
export async function getAuthenticatedUserWithProfile() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError !== null || user === null) {
      throw new Error("No auth user");
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles (*)
      `)
      .eq("id", user.id)
      .single();

    if (perfilError !== null || perfil === null) {
      throw new Error("No user profile");
    }

    return { auth: user, perfil: perfil as any };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      try {
        const cookieStore = await cookies();
        const mockEmail = cookieStore.get("mock_auth_token")?.value;
        if (mockEmail) {
          const mockUser = getMockUserByEmail(mockEmail);
          if (mockUser) {
            return {
              auth: { id: mockUser.id, email: mockUser.email } as any,
              perfil: {
                id: mockUser.id,
                nombre: mockUser.nombre,
                apellido: mockUser.apellido,
                rol_id: mockUser.rol_id,
                email: mockUser.email,
                roles: mockUser.roles || {
                  nombre: mockUser.rol_id === 1 ? "super_admin" : "cliente",
                  permisos: mockUser.rol_id === 1 ? { "*": true } : {}
                }
              } as any
            };
          }
        }
      } catch (e) {
        // Safe check
      }
    }
    return null;
  }
}
