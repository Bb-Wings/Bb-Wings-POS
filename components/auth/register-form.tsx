'use client'
/**
 * @fileoverview Register Form — BB Wings Management System
 * @description Formulario de registro multi-campo con validación Zod y Server Action.
 * @version 2.0.0
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, UserPlus, AlertCircle } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth.schema";
import { registerAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/store/ui.store";

// ─── Strength config ──────────────────────────────────────────────────────

const STRENGTH_COLORS = ["", "#dc2626", "#f59e0b", "#22c55e", "#16a34a"];
const STRENGTH_LABELS = ["", "Débil", "Regular", "Buena", "Fuerte"];

// ─── Component ────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const password = watch("password");

  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await registerAction(data);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof RegisterFormValues, { message: msgs[0] });
          });
        }
        if (result.error) setServerError(result.error);
        return;
      }
      toast.success("¡Cuenta creada!", "Revisa tu correo para confirmar tu cuenta.");
      router.push("/login");
    });
  };

  // Password strength
  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)       s++;
    if (/[A-Z]/.test(password))     s++;
    if (/[0-9]/.test(password))     s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        aria-label="Formulario de registro"
      >
        {/* Server error */}
        {serverError !== null && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
            role="alert"
          >
            <AlertCircle style={{ width: "15px", height: "15px", color: "#f87171", flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "0.82rem", color: "#f87171", lineHeight: 1.5 }}>{serverError}</span>
          </div>
        )}

        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            {...register("nombre")}
            label="Nombre"
            placeholder="Juan"
            autoComplete="given-name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.nombre?.message}
            required
            id="register-nombre"
          />
          <Input
            {...register("apellido")}
            label="Apellido"
            placeholder="García"
            autoComplete="family-name"
            error={errors.apellido?.message}
            required
            id="register-apellido"
          />
        </div>

        {/* Email */}
        <Input
          {...register("email")}
          type="email"
          label="Correo electrónico"
          placeholder="tu@correo.com"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          required
          id="register-email"
        />

        {/* Phone */}
        <Input
          {...register("telefono")}
          type="tel"
          label="Teléfono (opcional)"
          placeholder="+52 55 1234 5678"
          autoComplete="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.telefono?.message}
          id="register-telefono"
        />

        {/* Password + Strength */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Input
            {...register("password")}
            type="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            required
            id="register-password"
          />
          {password && (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {/* Strength bar */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    aria-hidden="true"
                    style={{
                      height: "3px",
                      flex: 1,
                      borderRadius: "999px",
                      background: passwordStrength >= level
                        ? STRENGTH_COLORS[passwordStrength]
                        : "rgba(255,255,255,0.1)",
                      transition: "background 0.3s ease",
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                Seguridad:{" "}
                <span style={{ fontWeight: 700, color: STRENGTH_COLORS[passwordStrength] }}>
                  {STRENGTH_LABELS[passwordStrength]}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <Input
          {...register("confirmPassword")}
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          required
          id="register-confirm-password"
        />

        {/* Terms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input
              {...register("acceptTerms")}
              type="checkbox"
              id="register-terms"
              style={{
                width: "15px",
                height: "15px",
                flexShrink: 0,
                marginTop: "2px",
                accentColor: "#ea580c",
                cursor: "pointer",
              }}
            />
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Acepto los{" "}
              <Link
                href="/terms"
                style={{ color: "#f97316", fontWeight: 600, textDecoration: "underline", textDecorationStyle: "dotted" }}
              >
                Términos de Uso
              </Link>
              {" "}y la{" "}
              <Link
                href="/privacy"
                style={{ color: "#f97316", fontWeight: 600, textDecoration: "underline", textDecorationStyle: "dotted" }}
              >
                Política de Privacidad
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p style={{ fontSize: "0.72rem", color: "#f87171", paddingLeft: "25px" }}>
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPending}
          loadingText="Creando cuenta..."
          leftIcon={<UserPlus className="h-4 w-4" />}
          id="register-submit"
        >
          Crear Cuenta Gratis
        </Button>

        {/* Login link */}
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fb923c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
