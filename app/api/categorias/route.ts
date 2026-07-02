import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbCategoria } from "@/types/database.types";

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna la lista de categorías ordenadas por orden y nombre.
 *   post:
 *     summary: Crear una nueva categoría
 *     description: Inserta una nueva categoría. Requiere rol de admin o super_admin.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activaOnly = searchParams.get("activa");

  try {
    const supabase = await createClient();
    let query = supabase.from("categorias").select("*");

    if (activaOnly === "true") {
      query = query.eq("activa", true);
    }

    const { data: categorias, error } = await query
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: categorias });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError !== null || user === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    // Verificar rol de admin o super_admin
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", user.id)
      .single();

    if (perfilError !== null || perfil === null) {
      return NextResponse.json({ success: false, error: "Perfil no encontrado" }, { status: 404 });
    }

    const perfilTyped = perfil as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.nombre) {
      return NextResponse.json({ success: false, error: "El nombre es requerido." }, { status: 400 });
    }

    // Generar slug
    const slug = body.slug || body.nombre
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newCategoryData: Omit<DbCategoria, "id" | "created_at" | "updated_at"> = {
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      imagen_url: body.imagen_url || null,
      slug: slug,
      orden: body.orden !== undefined ? parseInt(body.orden, 10) : 0,
      activa: body.activa !== undefined ? !!body.activa : true,
    };

    const { data: newCategory, error: insertError } = await supabase
      .from("categorias")
      .insert(newCategoryData)
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
