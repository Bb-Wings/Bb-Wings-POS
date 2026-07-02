import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbProducto } from "@/types/database.types";

/**
 * Helper para verificar la sesión del administrador
 */
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

/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna un único producto de la base de datos por su identificador primario.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto devuelto con éxito
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: producto, error } = await supabase
      .from("productos")
      .select("*")
      .eq("id", productId)
      .single();

    if (error || !producto) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: producto });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto existente
 *     description: Modifica los campos de un producto. Requiere rol de administrador.
 *     security:
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Producto actualizado con éxito
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
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

    // Validar si existe el producto
    const { data: existingProduct, error: checkError } = await supabase
      .from("productos")
      .select("id")
      .eq("id", productId)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    const updateData: Partial<Omit<DbProducto, "id" | "created_at">> = {};

    if (body.categoria_id !== undefined) updateData.categoria_id = parseInt(body.categoria_id, 10);
    if (body.nombre !== undefined) updateData.nombre = body.nombre;
    if (body.descripcion !== undefined) updateData.descripcion = body.descripcion;
    if (body.precio !== undefined) updateData.precio = parseFloat(body.precio);
    if (body.precio_costo !== undefined) updateData.precio_costo = body.precio_costo !== null ? parseFloat(body.precio_costo) : null;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.codigo_barras !== undefined) updateData.codigo_barras = body.codigo_barras;
    if (body.imagen_principal !== undefined) updateData.imagen_principal = body.imagen_principal;
    if (body.calorias !== undefined) updateData.calorias = body.calorias !== null ? parseInt(body.calorias, 10) : null;
    if (body.es_nuevo !== undefined) updateData.es_nuevo = !!body.es_nuevo;
    if (body.es_popular !== undefined) updateData.es_popular = !!body.es_popular;
    if (body.es_vegetariano !== undefined) updateData.es_vegetariano = !!body.es_vegetariano;
    if (body.es_picante !== undefined) updateData.es_picante = !!body.es_picante;
    if (body.nivel_picante !== undefined) updateData.nivel_picante = body.nivel_picante !== null ? parseInt(body.nivel_picante, 10) : null;
    if (body.tiempo_preparacion !== undefined) updateData.tiempo_preparacion = body.tiempo_preparacion !== null ? parseInt(body.tiempo_preparacion, 10) : null;
    if (body.disponible !== undefined) updateData.disponible = !!body.disponible;
    if (body.estado !== undefined) updateData.estado = body.estado;
    if (body.orden !== undefined) updateData.orden = parseInt(body.orden, 10);

    const { data: updatedProduct, error: updateError } = await supabase
      .from("productos")
      .update(updateData)
      .eq("id", productId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     description: Remueve un producto del catálogo. Requiere rol de administrador.
 *     security:
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado con éxito
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error de restricción de base de datos o error de servidor
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
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

    // Validar si existe el producto
    const { data: existingProduct, error: checkError } = await supabase
      .from("productos")
      .select("id")
      .eq("id", productId)
      .single();

    if (checkError || !existingProduct) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: `No se pudo eliminar el producto: ${deleteError.message}. Asegúrese de que no esté referenciado en otros pedidos.` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Producto eliminado con éxito" });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
