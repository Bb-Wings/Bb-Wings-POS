import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect destination
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Intentar obtener/crear el perfil en la tabla de usuarios
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("id, rol_id")
          .eq("id", user.id)
          .single();

        if (!perfil) {
          // Si no existe el perfil de usuario, crearlo con rol de cliente (id 7)
          const metadata = user.user_metadata || {};
          const nombre = metadata.nombre || metadata.full_name?.split(" ")[0] || "Usuario";
          const apellido = metadata.apellido || metadata.full_name?.split(" ").slice(1).join(" ") || "";
          
          await supabase.from("usuarios").insert({
            id: user.id,
            rol_id: 7, // cliente
            email: user.email ?? "",
            nombre,
            apellido,
            activo: true,
          });

          // Crear también el registro de cliente
          await supabase.from("clientes").insert({
            usuario_id: user.id,
            puntos_acumulados: 0,
            puntos_canjeados: 0,
            nivel_fidelidad: "bronce",
          });
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // retornar al usuario a login con error
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
