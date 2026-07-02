/**
 * @fileoverview Admin Layout — BB Wings Management System
 * @description Layout del panel de administración con sidebar colapsable,
 * navegación por rol y estado de sesión.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedUserWithProfile } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin — BB Wings",
    default: "Panel de Administración | BB Wings",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthenticatedUserWithProfile();

  if (!session) {
    redirect("/login?redirect=/admin/dashboard");
  }

  const rolNombre = session.perfil?.roles
    ? (typeof session.perfil.roles === "object" && !Array.isArray(session.perfil.roles)
        ? (session.perfil.roles as { nombre: string }).nombre
        : "")
    : "";

  if (rolNombre !== "super_admin" && rolNombre !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Sidebar */}
      <AdminSidebar userRole={rolNombre} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <AdminHeader
          userName={`${session.perfil?.nombre ?? ""} ${session.perfil?.apellido ?? ""}`}
          userRole={rolNombre}
        />
        <main
          id="admin-main"
          className="flex-1 p-6 overflow-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
