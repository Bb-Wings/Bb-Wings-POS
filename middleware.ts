/**
 * @fileoverview Next.js Middleware — BB Wings Management System
 * @description Middleware de autenticación y autorización basado en roles.
 * Protege rutas por rol usando Supabase SSR. Se ejecuta en el Edge Runtime.
 * @version 1.0.0
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

// ─── Route Configuration ───────────────────────────────────────────────────

/** Rutas que requieren autenticación básica */
const PROTECTED_ROUTES = [
  "/perfil",
  "/carrito",
  "/checkout",
  "/pedidos",
  "/favoritos",
  "/historial",
];

/** Rutas exclusivas para administradores */
const ADMIN_ROUTES = ["/admin"];

/** Rutas exclusivas para cajeros (o admin) */
const CAJERO_ROUTES = ["/pos"];

/** Rutas exclusivas para cocina (o admin) */
const COCINA_ROUTES = ["/kitchen"];

/** Rutas de autenticación — redirigen al inicio si ya está autenticado */
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// ─── Role Checks ───────────────────────────────────────────────────────────

function isAdminRole(rol: string): boolean {
  return rol === "super_admin" || rol === "admin";
}

function isCajeroRole(rol: string): boolean {
  return rol === "cajero" || isAdminRole(rol);
}

function isCocinaRole(rol: string): boolean {
  return rol === "cocinero" || isAdminRole(rol);
}

// ─── Middleware ────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: No ejecutar código entre createServerClient y auth.getUser()
  // para no desincronizar el estado de las cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ─── Si no está autenticado ─────────────────────────────────────────────

  if (!user) {
    const isProtected =
      PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) ||
      ADMIN_ROUTES.some((route) => pathname.startsWith(route)) ||
      CAJERO_ROUTES.some((route) => pathname.startsWith(route)) ||
      COCINA_ROUTES.some((route) => pathname.startsWith(route));

    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // ─── Usuario autenticado ────────────────────────────────────────────────

  // Redirigir desde rutas de auth al dashboard correspondiente
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Obtener rol del usuario para verificar permisos
  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol_id, roles(nombre)")
    .eq("id", user.id)
    .single();

  // Extraer el nombre del rol de forma segura
  const perfilTyped = perfil as any;
  const rolData = perfilTyped?.roles;
  const rolNombre: string =
    rolData && typeof rolData === "object" && !Array.isArray(rolData)
      ? (rolData as { nombre: string }).nombre
      : "cliente";

  // ─── Verificar acceso a rutas de admin ─────────────────────────────────

  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isAdminRole(rolNombre)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ─── Verificar acceso a rutas de cajero ────────────────────────────────

  if (CAJERO_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isCajeroRole(rolNombre)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // ─── Verificar acceso a rutas de cocina ────────────────────────────────

  if (COCINA_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isCocinaRole(rolNombre)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return supabaseResponse;
}

// ─── Matcher Configuration ────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - Archivos de imagen, fuentes, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};
