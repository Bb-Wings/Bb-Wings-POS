/**
 * @fileoverview POS Page entry point — BB Wings Management System
 * @description Servidor que precarga productos, categorías y clientes para la terminal de ventas (POS).
 * @version 1.0.0
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PosManager } from "@/components/pos/pos-manager";

export const metadata: Metadata = {
  title: "Punto de Venta (POS)",
};

async function getPosData() {
  try {
    const supabase = await createClient();

    // 1. Obtener categorías activas
    const { data: categorias } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("activa", true)
      .order("orden", { ascending: true });

    // 2. Obtener productos activos/disponibles
    const { data: productos } = await supabase
      .from("productos")
      .select("id, categoria_id, nombre, precio, disponible, imagen_principal")
      .eq("disponible", true)
      .eq("estado", "activo")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    // 3. Obtener clientes para asociar acumulación de puntos (con nombre y apellido de usuarios)
    const { data: clientes } = await supabase
      .from("clientes")
      .select(`
        id,
        puntos_acumulados,
        usuarios (
          nombre,
          apellido,
          email
        )
      `);

    return {
      categorias: categorias ?? [],
      productos: productos ?? [],
      clientes: (clientes as any) ?? [],
    };
  } catch {
    return {
      categorias: [],
      productos: [],
      clientes: [],
    };
  }
}

export default async function POSPage() {
  const { categorias, productos, clientes } = await getPosData();

  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#0c0c0c" }}>
          <div style={{ textAlign: "center", color: "#fff" }}>
            <h2 style={{ fontWeight: 800 }}>Iniciando Terminal de Ventas...</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>Cargando catálogo de productos y base de clientes</p>
          </div>
        </div>
      }
    >
      <PosManager
        initialCategories={categorias}
        initialProducts={productos}
        initialClients={clientes}
      />
    </Suspense>
  );
}
