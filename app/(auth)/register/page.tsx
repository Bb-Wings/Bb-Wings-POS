/**
 * @fileoverview Register Page — BB Wings Management System
 */

import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Regístrate en BB Wings y únete al programa de puntos.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">
          Crea tu cuenta
        </h1>
        <p className="text-gray-muted">
          Únete gratis y empieza a ganar puntos desde tu primer pedido
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
