import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * @fileoverview Upload API Route — BB Wings Management System
 * @description Sube imágenes al bucket de Supabase Storage usando el cliente
 * de service_role para bypasear las políticas RLS del bucket.
 * Solo accesible por usuarios autenticados con rol admin/super_admin.
 *
 * POST /api/upload
 * Body: multipart/form-data con campo "file"
 * Response: { success: boolean, url?: string, error?: string }
 */

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "productos";
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    // ── 1. Verificar autenticación ──────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError !== null || user === null) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    // ── 2. Verificar rol admin ──────────────────────────────────────────────
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", user.id)
      .single();

    const perfilTyped = perfil as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Acceso no autorizado" },
        { status: 403 }
      );
    }

    // ── 3. Parsear FormData ─────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    // ── 4. Validar tipo y tamaño ────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "La imagen supera el límite de 5 MB." },
        { status: 400 }
      );
    }

    // ── 5. Subir con cliente de service_role (bypasea RLS) ─────────────────
    const adminClient = createAdminClient();

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `menu/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Error de Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // ── 6. Obtener URL pública ──────────────────────────────────────────────
    const { data: urlData } = adminClient.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json(
      { success: true, url: urlData.publicUrl, path: storagePath },
      { status: 201 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
