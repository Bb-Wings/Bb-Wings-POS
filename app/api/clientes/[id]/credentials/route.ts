import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, getCredentialsEmailTemplate } from "@/lib/email";

/**
 * @fileoverview Clientes Credentials Reset & Send API Route — BB Wings
 * @description Genera una contraseña temporal y la envía al correo del usuario vía SMTP.
 * @version 1.0.0
 */

export async function POST(
  _request: Request,
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

    // Verificar si existe el usuario para obtener su email y nombre
    const { data: targetUser, error: checkError } = await adminSupabase
      .from("usuarios")
      .select("nombre, apellido, email")
      .eq("id", id)
      .single();

    if (checkError || !targetUser) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
    }

    // 2. Generar contraseña temporal
    const tempPassword = `BB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    // 3. Enviar correo SMTP
    try {
      const emailHtml = getCredentialsEmailTemplate(
        `${targetUser.nombre} ${targetUser.apellido}`,
        targetUser.email,
        tempPassword
      );
      await sendEmail({
        to: targetUser.email,
        subject: "Tus Credenciales de Acceso - BB Wings",
        html: emailHtml,
      });
    } catch (emailError: any) {
      return NextResponse.json({
        success: false,
        error: `Error al enviar el correo de credenciales: ${emailError.message || emailError}.`
      }, { status: 500 });
    }

    // 4. Actualizar contraseña en Supabase Auth
    const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(id, {
      password: tempPassword,
    });

    if (passwordError) {
      return NextResponse.json({ success: false, error: `Error al actualizar contraseña en Auth: ${passwordError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Credenciales enviadas correctamente a ${targetUser.email}.` });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
