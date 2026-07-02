'use server'
/**
 * @fileoverview Auth Server Actions — BB Wings Management System
 * @description Server Actions para autenticación: login, registro, logout
 * y gestión de sesiones usando Supabase Auth.
 * @version 1.0.0
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth.schema";

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
  const supabase = await createClient();

  // ── Autenticación ──────────────────────────────────────────────────────────
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mapear errores de Supabase a mensajes en español
    const errorMessages: Record<string, string> = {
      "Invalid login credentials": "Correo o contraseña incorrectos.",
      "Email not confirmed": "Confirma tu correo electrónico antes de iniciar sesión.",
      "Too many requests": "Demasiados intentos fallidos. Espera unos minutos.",
    };

    return {
      success: false,
      error: errorMessages[error.message] ?? "Error al iniciar sesión. Intenta de nuevo.",
    };
  }

  // ── Log de auditoría ───────────────────────────────────────────────────────
  try {
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await adminSupabase.from("logs").insert({
        usuario_id: user.id,
        nivel: "info",
        modulo: "auth",
        accion: "login",
        mensaje: `Usuario ${email} inició sesión`,
        datos: { email },
      });
    }
  } catch {
    // No fallar por error de log
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
  const supabase = await createClient();

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

  // ── Crear usuario en Supabase Auth ─────────────────────────────────────────
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        apellido,
        telefono: telefono ?? null,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      error: "Error al crear la cuenta. Intenta de nuevo.",
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: "No se pudo crear la cuenta. Intenta de nuevo.",
    };
  }

  // ── Obtener rol de cliente ────────────────────────────────────────────────
  const { data: rolCliente } = await adminSupabase
    .from("roles")
    .select("id")
    .eq("nombre", "cliente")
    .single();

  // ── Crear perfil en la tabla usuarios ────────────────────────────────────
  const { error: perfilError } = await adminSupabase.from("usuarios").insert({
    id: authData.user.id,
    rol_id: rolCliente?.id ?? 7,
    email,
    nombre,
    apellido,
    telefono: telefono ?? null,
    activo: true,
  });

  if (perfilError) {
    // Rollback: eliminar el usuario de Auth si falla el perfil
    await adminSupabase.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      error: "Error al crear el perfil. Intenta de nuevo.",
    };
  }

  // ── Crear perfil de cliente ───────────────────────────────────────────────
  await adminSupabase.from("clientes").insert({
    usuario_id: authData.user.id,
    puntos_acumulados: 0,
    puntos_canjeados: 0,
    nivel_fidelidad: "bronce",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

// ─── Logout Action ────────────────────────────────────────────────────────

/**
 * Server Action para cerrar sesión.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Get Session ──────────────────────────────────────────────────────────

/**
 * Obtiene la sesión actual del servidor.
 * Uso interno en Server Components que necesitan el usuario.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error !== null || user === null) {
    return null;
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
}
