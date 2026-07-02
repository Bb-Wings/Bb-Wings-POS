import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * @fileoverview Clientes ID API Route — BB Wings Management System
 * @description Permite editar el rol y datos básicos de un usuario por ID.
 * Requiere rol de admin o super_admin.
 * @version 1.1.0
 */

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido." }, { status: 400 });
    }

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
    const { rol_id, nombre, apellido, telefono } = body;

    // Verificar si existe el usuario
    const { data: targetUser, error: checkError } = await adminSupabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (checkError || !targetUser) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    // 2. Actualizar Campos de Perfil y Rol
    const updateData: Record<string, any> = {};

    if (rol_id !== undefined) updateData.rol_id = parseInt(rol_id, 10);
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (telefono !== undefined) updateData.telefono = telefono || null;

    // Actualizar en Supabase Auth metadata si cambia nombre/apellido/telefono
    if (nombre !== undefined || apellido !== undefined || telefono !== undefined) {
      const metadataUpdates: Record<string, any> = {};
      if (nombre !== undefined) metadataUpdates.nombre = nombre;
      if (apellido !== undefined) metadataUpdates.apellido = apellido;
      if (telefono !== undefined) metadataUpdates.telefono = telefono || null;

      await adminSupabase.auth.admin.updateUserById(id, {
        user_metadata: metadataUpdates
      });
    }

    const { data: updatedUser, error: updateError } = await adminSupabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        roles (*)
      `)
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedUser });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "ID de usuario inválido." }, { status: 400 });
    }

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

    // No permitir auto-eliminarse
    if (adminUser.id === id) {
      return NextResponse.json({ success: false, error: "No puedes eliminar tu propio usuario." }, { status: 400 });
    }

    // Eliminar de Supabase Auth (esto elimina en cascada o borramos perfil primero)
    // Borrar de 'clientes' si existe
    await adminSupabase.from("clientes").delete().eq("usuario_id", id);
    
    // Borrar perfil en 'usuarios'
    await adminSupabase.from("usuarios").delete().eq("id", id);

    // Borrar de Supabase Auth
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado con éxito" });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
