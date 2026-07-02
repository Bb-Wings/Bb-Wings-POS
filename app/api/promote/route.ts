import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  const supabase = createAdminClient();

  try {
    // 1. Get all roles to find super_admin
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, nombre");

    if (rolesError) {
      return NextResponse.json({ success: false, error: rolesError.message }, { status: 500 });
    }

    const superAdminRole = roles.find((r: any) => r.nombre === "super_admin");
    if (!superAdminRole) {
      return NextResponse.json({ success: false, error: "super_admin role not found" }, { status: 500 });
    }

    // 2. Get auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 });
    }

    const usersToPromote = email
      ? authData.users.filter((u: any) => u.email === email)
      : authData.users;

    if (usersToPromote.length === 0) {
      return NextResponse.json({ success: false, error: "No users found to promote" }, { status: 404 });
    }

    const results = [];

    for (const user of usersToPromote) {
      // Confirm email in Auth
      const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      // Update or insert profile in usuarios table
      const { data: profile } = await supabase
        .from("usuarios")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      let profileResult = "";
      if (!profile) {
        // Create profile as super_admin
        const { error: insertError } = await supabase.from("usuarios").insert({
          id: user.id,
          rol_id: superAdminRole.id,
          email: user.email,
          nombre: user.user_metadata?.nombre || "Admin",
          apellido: user.user_metadata?.apellido || "User",
          activo: true,
        });
        profileResult = insertError ? `Error profile insert: ${insertError.message}` : "Profile created as super_admin";
      } else {
        // Update profile to super_admin
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({ rol_id: superAdminRole.id })
          .eq("id", user.id);
        profileResult = updateError ? `Error profile update: ${updateError.message}` : "Profile updated to super_admin";
      }

      // Ensure client record exists
      const { data: client } = await supabase
        .from("clientes")
        .select("usuario_id")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (!client) {
        await supabase.from("clientes").insert({
          usuario_id: user.id,
          puntos_acumulados: 0,
          puntos_canjeados: 0,
          nivel_fidelidad: "bronce",
        });
      }

      results.push({
        email: user.email,
        emailConfirmed: !confirmError,
        profileResult,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${usersToPromote.length} user(s).`,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
