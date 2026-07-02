'use client'
/**
 * @fileoverview Login Form — BB Wings Management System
 * @description Formulario de login con React Hook Form, validación Zod,
 * animaciones y integración con Supabase Auth Server Action.
 * @version 1.0.0
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import { loginAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/store/ui.store";

// ─── Component ────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof LoginFormValues, {
              message: msgs[0],
            });
          });
        }
        if (result.error) {
          setServerError(result.error);
        }
        return;
      }

      toast.success("¡Bienvenido!", "Has iniciado sesión correctamente.");
      router.push(redirectTo);
      router.refresh();
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
        aria-label="Formulario de inicio de sesión"
      >
        {/* Server error */}
        {serverError !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
            role="alert"
          >
            {serverError}
          </motion.div>
        )}

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
          id="login-email"
        />

        {/* Password */}
        <Input
          {...register("password")}
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          required
          id="login-password"
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              {...register("rememberMe")}
              type="checkbox"
              id="login-remember"
              className="h-4 w-4 rounded border-card-border bg-card text-primary focus:ring-primary/20 focus:ring-2"
            />
            <span className="text-sm text-gray-muted group-hover:text-white transition-colors">
              Recordarme
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-400 transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isPending}
          loadingText="Iniciando sesión..."
          leftIcon={<LogIn className="h-4 w-4" />}
          id="login-submit"
        >
          Iniciar Sesión
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-card-border" />
          <span className="text-xs text-gray-muted font-ui flex-shrink-0">o continúa con</span>
          <div className="flex-1 h-px bg-card-border" />
        </div>

        {/* Google OAuth placeholder */}
        <Button
          type="button"
          variant="glass"
          size="lg"
          fullWidth
          id="login-google"
          onClick={() => {
            toast.info("Próximamente", "El login con Google estará disponible pronto.");
          }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-gray-muted">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-primary hover:text-primary-400 font-semibold transition-colors"
          >
            Regístrate gratis
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
