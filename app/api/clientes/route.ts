import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, getCredentialsEmailTemplate } from "@/lib/email";

/**
 * @fileoverview Clientes API Route — BB Wings Management System
 * @description Maneja el listado y la creación de usuarios/clientes.
 * Requiere rol de admin o super_admin.
 */

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verificar autenticación y rol de administrador
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError !== null || user === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", user.id)
      .single();

    const perfilTyped = perfil as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    // 2. Obtener lista de usuarios con su rol
    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles (*)
      `)
      .order("created_at", { ascending: false });

    if (usuariosError) {
      return NextResponse.json({ success: false, error: usuariosError.message }, { status: 500 });
    }

    // 3. Obtener lista de todos los roles disponibles para el formulario
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .order("id", { ascending: true });

    if (rolesError) {
      return NextResponse.json({ success: false, error: rolesError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        usuarios,
        roles,
      }
    });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
    const { email, password, nombre, apellido, telefono, rol_id, enviar_correo } = body;

    if (!email || !nombre || !apellido || !rol_id) {
      return NextResponse.json({ success: false, error: "Campos requeridos faltantes." }, { status: 400 });
    }

    // 2. Verificar si el correo ya está registrado en la base de datos
    const { data: existingUser } = await adminSupabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "Este correo electrónico ya está registrado." }, { status: 400 });
    }

    let authUser = null;

    if (enviar_correo) {
      // Método A: Generar contraseña temporal, enviar correo SMTP, y crear en Supabase Auth
      const tempPassword = `BB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

      try {
        const emailHtml = getCredentialsEmailTemplate(`${nombre} ${apellido}`, email, tempPassword);
        await sendEmail({
          to: email,
          subject: "Tus Credenciales de Acceso - BB Wings",
          html: emailHtml,
        });
      } catch (emailError: any) {
        return NextResponse.json({
          success: false,
          error: `Error al enviar el correo de credenciales: ${emailError.message || emailError}. El usuario no fue creado.`
        }, { status: 500 });
      }

      const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          nombre,
          apellido,
          telefono: telefono || null,
        }
      });

      if (createError) {
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
      }
      authUser = createData.user;
    } else {
      // Método B: Crear directamente con contraseña manual sin enviar correo
      if (!password || password.length < 6) {
        return NextResponse.json({ success: false, error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
      }

      const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nombre,
          apellido,
          telefono: telefono || null,
        }
      });

      if (createError) {
        return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
      }
      authUser = createData.user;
    }

    if (!authUser) {
      return NextResponse.json({ success: false, error: "No se pudo crear el usuario en Supabase Auth." }, { status: 500 });
    }

    // 3. Crear perfil en la tabla de usuarios
    const { error: insertUserError } = await adminSupabase
      .from("usuarios")
      .insert({
        id: authUser.id,
        rol_id: parseInt(rol_id, 10),
        email: email,
        nombre: nombre,
        apellido: apellido,
        telefono: telefono || null,
        activo: true,
      });

    if (insertUserError) {
      // Revertir creación en Auth
      await adminSupabase.auth.admin.deleteUser(authUser.id);
      return NextResponse.json({ success: false, error: insertUserError.message }, { status: 500 });
    }

    // 4. Si el rol asignado es de "cliente", insertar también en la tabla 'clientes'
    const { data: targetRole } = await adminSupabase
      .from("roles")
      .select("nombre")
      .eq("id", parseInt(rol_id, 10))
      .single();

    if (targetRole?.nombre === "cliente") {
      await adminSupabase.from("clientes").insert({
        usuario_id: authUser.id,
        puntos_acumulados: 0,
        puntos_canjeados: 0,
        nivel_fidelidad: "bronce",
      });
    }

    // Retornar el usuario recién creado
    const { data: finalUser } = await adminSupabase
      .from("usuarios")
      .select(`
        *,
        roles (*)
      `)
      .eq("id", authUser.id)
      .single();

    return NextResponse.json({ success: true, data: finalUser }, { status: 201 });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
