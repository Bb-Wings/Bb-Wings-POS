import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbProducto } from "@/types/database.types";

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener catálogo de productos
 *     description: Retorna la lista de productos con soporte para filtros de búsqueda, categoría y disponibilidad.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda por nombre del producto
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: disponible
 *         schema:
 *           type: boolean
 *         description: Filtrar por disponibilidad (true/false)
 *     responses:
 *       200:
 *         description: Lista de productos devuelta con éxito
 *       500:
 *         description: Error interno del servidor
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const categoriaId = searchParams.get("categoria_id");
  const disponible = searchParams.get("disponible");

  try {
    const supabase = await createClient();
    let query = supabase.from("productos").select("*");

    if (search) {
      query = query.ilike("nombre", `%${search}%`);
    }

    if (categoriaId) {
      const parsedCatId = parseInt(categoriaId, 10);
      if (!isNaN(parsedCatId)) {
        query = query.eq("categoria_id", parsedCatId);
      }
    }

    if (disponible !== null) {
      query = query.eq("disponible", disponible === "true");
    }

    // Ordenar por 'orden' y luego por 'nombre'
    const { data: productos, error } = await query
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: productos });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     description: Inserta un nuevo producto en el catálogo. Requiere rol de admin o super_admin.
 *     security:
 *       - SessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoria_id
 *               - nombre
 *               - precio
 *             properties:
 *               categoria_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               precio_costo:
 *                 type: number
 *               slug:
 *                 type: string
 *               sku:
 *                 type: string
 *               imagen_principal:
 *                 type: string
 *               calorias:
 *                 type: integer
 *               es_nuevo:
 *                 type: boolean
 *               es_popular:
 *                 type: boolean
 *               es_vegetariano:
 *                 type: boolean
 *               es_picante:
 *                 type: boolean
 *               nivel_picante:
 *                 type: integer
 *               tiempo_preparacion:
 *                 type: integer
 *               disponible:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado con éxito
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (no es administrador)
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError !== null || user === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea admin o super_admin
    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("rol_id, roles(nombre)")
      .eq("id", user.id)
      .single();

    if (perfilError !== null || perfil === null) {
      return NextResponse.json({ success: false, error: "Perfil no encontrado" }, { status: 404 });
    }

    const perfilTyped = perfil as unknown as {
      rol_id: number;
      roles: { nombre: string } | null;
    } | null;

    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    const body = await request.json();

    // Validar requeridos
    if (!body.nombre || body.precio === undefined || body.precio === "") {
      return NextResponse.json(
        { success: false, error: "Los campos nombre y precio son requeridos." },
        { status: 400 }
      );
    }

    // Si no se provee categoria_id, usar la primera categoría activa disponible
    let categoriaId: number;
    if (body.categoria_id) {
      categoriaId = parseInt(body.categoria_id, 10);
    } else {
      const { data: firstCat } = await supabase
        .from("categorias")
        .select("id")
        .eq("activa", true)
        .order("orden", { ascending: true })
        .limit(1)
        .single();
      if (!firstCat) {
        return NextResponse.json(
          { success: false, error: "No hay categorías disponibles. Crea una categoría primero." },
          { status: 400 }
        );
      }
      categoriaId = firstCat.id;
    }

    // Generar slug automáticamente si no se provee
    const slug = body.slug || body.nombre
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newProductData: Omit<DbProducto, "id" | "created_at" | "updated_at"> = {
      categoria_id: categoriaId,
      nombre: body.nombre,
      descripcion: body.descripcion || null,
      precio: parseFloat(body.precio),
      precio_costo: body.precio_costo !== undefined ? parseFloat(body.precio_costo) : null,
      slug: slug,
      sku: body.sku || null,
      codigo_barras: body.codigo_barras || null,
      imagen_principal: body.imagen_principal || null,
      calorias: body.calorias !== undefined ? parseInt(body.calorias, 10) : null,
      es_nuevo: !!body.es_nuevo,
      es_popular: !!body.es_popular,
      es_vegetariano: !!body.es_vegetariano,
      es_picante: !!body.es_picante,
      nivel_picante: body.nivel_picante !== undefined ? parseInt(body.nivel_picante, 10) : null,
      tiempo_preparacion: body.tiempo_preparacion !== undefined ? parseInt(body.tiempo_preparacion, 10) : null,
      disponible: body.disponible !== undefined ? !!body.disponible : true,
      estado: body.estado || "activo",
      orden: body.orden !== undefined ? parseInt(body.orden, 10) : 0,
    };

    const { data: newProduct, error: insertError } = await supabase
      .from("productos")
      .insert(newProductData)
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
