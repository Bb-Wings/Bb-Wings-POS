import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbCategoria } from "@/types/database.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyAdminSession(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError !== null || user === null) {
    return { authorized: false, status: 401, error: "No autenticado" };
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios")
    .select("rol_id, roles(nombre)")
    .eq("id", user.id)
    .single();

  if (perfilError !== null || perfil === null) {
    return { authorized: false, status: 404, error: "Perfil no encontrado" };
  }

  const perfilTyped = perfil as unknown as {
    rol_id: number;
    roles: { nombre: string } | null;
  } | null;

  const rolNombre = perfilTyped?.roles?.nombre;

  if (rolNombre !== "admin" && rolNombre !== "super_admin") {
    return { authorized: false, status: 403, error: "Acceso no autorizado" };
  }

  return { authorized: true, user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: categoria, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("id", catId)
      .single();

    if (error || !categoria) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: categoria });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const verification = await verifyAdminSession(supabase);

    if (!verification.authorized) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: verification.status }
      );
    }

    const body = await request.json();

    // Verificar si existe la categoría
    const { data: existingCat, error: checkError } = await supabase
      .from("categorias")
      .select("id")
      .eq("id", catId)
      .single();

    if (checkError || !existingCat) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    const updateData: Partial<Omit<DbCategoria, "id" | "created_at">> = {};

    if (body.nombre !== undefined) {
      updateData.nombre = body.nombre;
      if (body.slug === undefined) {
        updateData.slug = body.nombre
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
    }
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion;
    if (body.imagen_url !== undefined) updateData.imagen_url = body.imagen_url;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.orden !== undefined) updateData.orden = parseInt(body.orden, 10);
    if (body.activa !== undefined) updateData.activa = !!body.activa;

    const { data: updatedCat, error: updateError } = await supabase
      .from("categorias")
      .update(updateData)
      .eq("id", catId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedCat });
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
    const catId = parseInt(id, 10);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const verification = await verifyAdminSession(supabase);

    if (!verification.authorized) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: verification.status }
      );
    }

    // 1. Verificar si la categoría existe
    const { data: category, error: checkError } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("id", catId)
      .single();

    if (checkError || !category) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    // 2. Verificar si hay productos asociados a esta categoría
    const { count, error: countError } = await supabase
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("categoria_id", catId);

    if (countError) {
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({
        success: false,
        error: `No se puede eliminar la categoría "${category.nombre}" porque tiene ${count} productos asociados. Por favor, reasigna o elimina los productos primero.`
      }, { status: 400 });
    }

    // 3. Eliminar la categoría
    const { error: deleteError } = await supabase
      .from("categorias")
      .delete()
      .eq("id", catId);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Categoría eliminada con éxito" });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
