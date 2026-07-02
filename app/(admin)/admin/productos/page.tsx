/**
 * @fileoverview Products Admin Page — BB Wings Management System
 * @description Página de administración de productos del menú.
 * @version 1.0.0
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductosManager } from "@/components/admin/productos-manager";
import { StatCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Gestión de Productos",
};

async function getCategorias() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("activa", true)
      .order("orden", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getProductos() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("productos")
      .select("*")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminProductosPage() {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
          Productos
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "4px" }}>
          Administra los productos de tu menú, precios, categorías y disponibilidad en tiempo real
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <ProductosManager initialProducts={productos} categorias={categorias} />
      </Suspense>
    </div>
  );
}
