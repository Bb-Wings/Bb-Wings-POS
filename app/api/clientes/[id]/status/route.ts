import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * @fileoverview Clientes Status Toggle API Route — BB Wings
 * @description Permite a los administradores activar/desactivar la cuenta de un usuario de forma precisa y rápida.
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
    const { activo } = body;

    if (activo === undefined) {
      return NextResponse.json({ success: false, error: "Falta el campo 'activo'." }, { status: 400 });
    }

    // 2. Actualizar estado del usuario en la base de datos
    const { error: dbError } = await adminSupabase
      .from("usuarios")
      .update({ activo: !!activo })
      .eq("id", id);

    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 });
    }

    // 3. Bloquear o desbloquear también en Supabase Auth
    const { error: authErrorUpdate } = await adminSupabase.auth.admin.updateUserById(id, {
      ban_duration: activo ? "none" : "876000h" // Banear por 100 años si no está activo, o remover baneo
    });

    if (authErrorUpdate) {
      console.error("Error al sincronizar estado en Auth:", authErrorUpdate.message);
      // No fallamos la petición si ya se actualizó en DB, pero lo registramos
    }

    return NextResponse.json({ success: true, message: `Usuario ${activo ? 'activado' : 'bloqueado'} con éxito.` });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
