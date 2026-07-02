/**
 * @fileoverview Clientes Admin Page — BB Wings Management System
 * @description Página de administración de clientes y usuarios del sistema.
 * @version 1.0.0
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ClientesManager } from "@/components/admin/clientes-manager";
import { StatCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Gestión de Clientes",
};

async function getUsuariosYRoles() {
  try {
    const supabase = await createClient();

    // 1. Obtener lista de usuarios ordenados por fecha de creación
    const { data: usuarios } = await supabase
      .from("usuarios")
      .select(`
        *,
        roles (*)
      `)
      .order("created_at", { ascending: false });

    // 2. Obtener lista de todos los roles para la asignación
    const { data: roles } = await supabase
      .from("roles")
      .select("*")
      .order("id", { ascending: true });

    return {
      usuarios: usuarios ?? [],
      roles: roles ?? [],
    };
  } catch {
    return {
      usuarios: [],
      roles: [],
    };
  }
}

export default async function AdminClientesPage() {
  const { usuarios, roles } = await getUsuariosYRoles();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
          Clientes y Usuarios
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "4px" }}>
          Administra las cuentas de tus clientes y el personal de staff, cambia roles, bloquea accesos y edita contraseñas
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <ClientesManager initialUsuarios={usuarios as any} roles={roles as any} />
      </Suspense>
    </div>
  );
}
