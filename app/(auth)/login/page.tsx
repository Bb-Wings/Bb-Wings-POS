/**
 * @fileoverview Login Page — BB Wings Management System
 * @description Página de inicio de sesión con formulario React Hook Form + Zod.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en BB Wings para acceder a tus pedidos, puntos y más.",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          Bienvenido de nuevo
        </h1>
        <p className="text-gray-muted">
          Ingresa tus datos para continuar
        </p>
      </div>
      <Suspense fallback={<div className="text-gray-muted text-sm text-center py-4">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
