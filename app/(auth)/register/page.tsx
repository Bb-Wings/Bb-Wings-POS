/**
 * @fileoverview Register Page — BB Wings Management System
 * @description Página de registro de nueva cuenta.
 * @version 2.0.0
 */

import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Crea tu cuenta en BB Wings y empieza a acumular puntos con cada pedido.",
};

export default function RegisterPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(234,88,12,0.1)",
            border: "1px solid rgba(234,88,12,0.25)",
            marginBottom: "1.25rem",
          }}
        >
          <UserPlus style={{ width: "13px", height: "13px", color: "#f97316" }} aria-hidden="true" />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#f97316", letterSpacing: "0.04em" }}>
            Registro gratuito
          </span>
        </div>
        <h1
          style={{
            fontSize: "1.9rem",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          Crea tu cuenta
        </h1>
        <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          Únete y empieza a acumular puntos con cada pedido
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}
