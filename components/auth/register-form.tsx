'use client'
/**
 * @fileoverview Register Form — BB Wings Management System
 * @description Formulario de registro multi-campo con validación Zod y Server Action.
 * @version 1.0.0
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, UserPlus } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth.schema";
import { registerAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/store/ui.store";

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
      acceptTerms: undefined as unknown as true,
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
        if (result.error) {
          setServerError(result.error);
        }
        return;
      }

      toast.success(
        "¡Cuenta creada!",
        "Revisa tu correo para confirmar tu cuenta."
      );
      router.push("/login");
    });
  };

  // Password strength indicator
  const passwordStrength = (() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  })();

  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const strengthColors = ["", "bg-danger", "bg-warning", "bg-secondary", "bg-success"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4"
        aria-label="Formulario de registro"
      >
        {/* Server error */}
        {serverError !== null && (
          <div
            className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Password */}
        <div className="space-y-1.5">
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
          {/* Strength bar */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      passwordStrength >= level
                        ? strengthColors[passwordStrength]
                        : "bg-card-border"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-muted">
                Seguridad:{" "}
                <span className={`font-medium ${
                  passwordStrength <= 1 ? "text-danger" :
                  passwordStrength === 2 ? "text-warning" :
                  passwordStrength === 3 ? "text-secondary" : "text-success"
                }`}>
                  {strengthLabels[passwordStrength]}
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
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              {...register("acceptTerms")}
              type="checkbox"
              id="register-terms"
              value="true"
              className="h-4 w-4 mt-0.5 rounded border-card-border bg-card text-primary focus:ring-primary/20 focus:ring-2 flex-shrink-0"
            />
            <span className="text-sm text-gray-muted group-hover:text-white transition-colors leading-relaxed">
              Acepto los{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Términos de Uso
              </Link>{" "}
              y la{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-danger ml-6">{errors.acceptTerms.message}</p>
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
        <p className="text-center text-sm text-gray-muted">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-400 font-semibold transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
