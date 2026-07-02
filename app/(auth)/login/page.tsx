/**
 * @fileoverview Login Page — BB Wings Management System
 * @description Página de inicio de sesión con formulario React Hook Form + Zod.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { Flame } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Inicia sesión en BB Wings para acceder a tus pedidos, puntos y más.",
};

export default function LoginPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2.25rem" }}>
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
          <Flame style={{ width: "13px", height: "13px", color: "#f97316" }} aria-hidden="true" />
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#f97316", letterSpacing: "0.04em" }}>
            Bienvenido de vuelta
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
          Inicia sesión
        </h1>
        <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          Ingresa tus datos para continuar a tu cuenta
        </p>
      </div>

      <Suspense
        fallback={
          <div style={{ textAlign: "center", padding: "1rem 0", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
            Cargando...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
