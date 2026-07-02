'use server'
/**
 * @fileoverview Auth Server Actions — BB Wings Management System
 * @description Server Actions para autenticación: login, registro, logout
 * y gestión de sesiones usando Supabase Auth.
 * @version 1.0.0
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import type { PerfilWithRoles } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth.schema";
import { getMockUserByEmail, addMockUser, getMockUsersCount } from "@/lib/supabase/mockDb";

// ─── Action Result Type ───────────────────────────────────────────────────

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── Login Action ─────────────────────────────────────────────────────────

/**
 * Server Action para iniciar sesión con email y contraseña.
 * Valida los datos con Zod antes de enviar a Supabase.
 */
export async function loginAction(
  formData: LoginFormValues
): Promise<ActionResult> {
  // ── Validación ────────────────────────────────────────────────────────────
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const cookieStore = await cookies();
    cookieStore.set("mock_auth_token", email, { path: "/", maxAge: 60 * 60 * 24 * 7 });
  } catch {
    if (process.env.NODE_ENV === "development") {
      const mockUser = getMockUserByEmail(email);
      if (mockUser && mockUser.password === password) {
        const cookieStore = await cookies();
        cookieStore.set("mock_auth_token", email, { path: "/", maxAge: 60 * 60 * 24 * 7 });
        revalidatePath("/", "layout");
        return { success: true };
      } else if (mockUser) {
        return { success: false, error: "Correo o contraseña incorrectos." };
      }
    }
    return {
      success: false,
      error: "Error al iniciar sesión. Intenta de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Register Action ──────────────────────────────────────────────────────

/**
 * Server Action para registrar un nuevo cliente.
 * Crea el usuario en Supabase Auth y el perfil en la base de datos.
 */
export async function registerAction(
  formData: RegisterFormValues
): Promise<ActionResult> {
  // ── Validación ────────────────────────────────────────────────────────────
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password, nombre, apellido, telefono } = parsed.data;

  try {
    // ── Verificar si el email ya existe ───────────────────────────────────────
    const adminSupabase = createAdminClient();
    const { data: existingUsers } = await adminSupabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return {
        success: false,
        fieldErrors: {
          email: ["Este correo electrónico ya está registrado."],
        },
      };
    }

    // ── Crear usuario en Supabase Auth con confirmación automática ─────────────
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellido,
        telefono: telefono ?? null,
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error("No se pudo crear la cuenta.");
    }

    // ── Contar total de usuarios para asignar rol ──────────────────────────────
    const { count: totalUsuarios } = await adminSupabase
      .from("usuarios")
      .select("*", { count: "exact", head: true });

    const isFirstUser = !totalUsuarios || totalUsuarios === 0;
    const roleName = isFirstUser ? "super_admin" : "cliente";

    // ── Obtener rol correspondiente ──────────────────────────────────────────
    const { data: targetRole } = await adminSupabase
      .from("roles")
      .select("id")
      .eq("nombre", roleName)
      .single();

    const finalRoleId = targetRole?.id ?? (isFirstUser ? 1 : 7);

    // ── Crear perfil en la tabla usuarios ────────────────────────────────────
    const { error: perfilError } = await adminSupabase.from("usuarios").insert({
      id: authData.user.id,
      rol_id: finalRoleId,
      email,
      nombre,
      apellido,
      telefono: telefono ?? null,
      activo: true,
    });

    if (perfilError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      throw perfilError;
    }

    // ── Crear perfil de cliente ───────────────────────────────────────────────
    await adminSupabase.from("clientes").insert({
      usuario_id: authData.user.id,
      puntos_acumulados: 0,
      puntos_canjeados: 0,
      nivel_fidelidad: "bronce",
    });

    // Sincronizar en el mock
    addMockUser({
      id: authData.user.id,
      email,
      password,
      nombre,
      apellido,
      telefono: telefono ?? undefined,
      rol_id: finalRoleId,
    });
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      const existing = getMockUserByEmail(email);
      if (existing) {
        return {
          success: false,
          fieldErrors: {
            email: ["Este correo electrónico ya está registrado."],
          },
        };
      }

      const mockId = crypto.randomUUID();
      const mockCount = getMockUsersCount();
      const finalRoleId = mockCount === 0 ? 1 : 7; // 1: super_admin, 7: cliente

      addMockUser({
        id: mockId,
        email,
        password,
        nombre,
        apellido,
        telefono: telefono ?? undefined,
        rol_id: finalRoleId,
      });

      const cookieStore = await cookies();
      cookieStore.set("mock_auth_token", email, { path: "/", maxAge: 60 * 60 * 24 * 7 });

      revalidatePath("/", "layout");
      return { success: true };
    }

    return {
      success: false,
      error: err instanceof Error ? err.message : "Error al crear la cuenta. Intenta de nuevo.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Logout Action ────────────────────────────────────────────────────────

/**
 * Server Action para cerrar sesión.
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Safe check
  }
  try {
    const cookieStore = await cookies();
    cookieStore.delete("mock_auth_token");
  } catch {
    // Safe check
  }
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Get Session ──────────────────────────────────────────────────────────

/**
 * Obtiene la sesión actual del servidor.
 * Uso interno en Server Components que necesitan el usuario.
 */
export async function getSession() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error !== null || user === null) {
      throw new Error("No auth user");
    }

    // Obtener perfil completo
    const { data: perfil } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles (nombre, permisos)
      `)
      .eq("id", user.id)
      .single();

    return { user, perfil };
  } catch {
    if (process.env.NODE_ENV === "development") {
      try {
        const cookieStore = await cookies();
        const mockEmail = cookieStore.get("mock_auth_token")?.value;
        if (mockEmail) {
          const mockUser = getMockUserByEmail(mockEmail);
          if (mockUser) {
            return {
              user: { id: mockUser.id, email: mockUser.email } as unknown as User,
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
              } as unknown as PerfilWithRoles
            };
          }
        }
      } catch {
        // Safe check
      }
    }
    return null;
  }
}
