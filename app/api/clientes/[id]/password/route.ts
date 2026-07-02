import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * @fileoverview Clientes Password Reset API Route — BB Wings
 * @description Permite a los administradores definir manualmente la contraseña de un usuario.
 * @version 1.0.0
 */

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Verificar autenticación y rol de administrador
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
    if (authError !== null || adminUser === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: perfilAdmin } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", adminUser.id)
      .single();

    const perfilTyped = perfilAdmin as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    // 2. Actualizar contraseña en Supabase Auth
    const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(id, {
      password: password,
    });

    if (passwordError) {
      return NextResponse.json({ success: false, error: `Error al actualizar contraseña: ${passwordError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente." });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
