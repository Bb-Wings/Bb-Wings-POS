/**
 * @fileoverview Categories Admin Page — BB Wings Management System
 * @description Página de administración de categorías del menú.
 * @version 1.0.0
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CategoriasManager } from "@/components/admin/categorias-manager";
import { StatCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Gestión de Categorías",
};

async function getCategorias() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminCategoriasPage() {
  const categorias = await getCategorias();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
          Categorías
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "4px" }}>
          Administra las categorías de tu menú, define su orden y contrólalas en tiempo real
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <CategoriasManager initialCategories={categorias} />
      </Suspense>
    </div>
  );
}
