'use client'
/**
 * @fileoverview Login Form — BB Wings Management System
 * @description Formulario de login con React Hook Form, validación Zod,
 * animaciones y integración con Supabase Auth Server Action.
 * @version 2.0.0
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";
import { loginAction } from "@/lib/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/store/ui.store";
import { createClient } from "@/lib/supabase/client";

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
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (data: LoginFormValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await loginAction(data);
      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, msgs]) => {
            setError(field as keyof LoginFormValues, { message: msgs[0] });
          });
        }
        if (result.error) setServerError(result.error);
        return;
      }
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let destination = redirectTo;

      if (user && redirectTo === "/") {
        const { data: perfil } = await supabase
          .from("usuarios")
          .select("roles(nombre)")
          .eq("id", user.id)
          .single();

        const rol = (perfil as any)?.roles?.nombre;
        if (rol === "super_admin" || rol === "admin") {
          destination = "/admin/dashboard";
        } else if (rol === "cajero") {
          destination = "/pos";
        }
      }

      toast.success("¡Bienvenido!", "Has iniciado sesión correctamente.");
      router.push(destination);
      router.refresh();
    });
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error("Error", err.message || "Error al iniciar sesión con Google.");
    }
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
        style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        aria-label="Formulario de inicio de sesión"
      >
        {/* Server error */}
        {serverError !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              {...register("rememberMe")}
              type="checkbox"
              id="login-remember"
              style={{ width: "15px", height: "15px", accentColor: "#ea580c", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
              Recordarme
            </span>
          </label>
          <Link
            href="/forgot-password"
            style={{ fontSize: "0.82rem", color: "#f97316", fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fb923c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", flexShrink: 0, letterSpacing: "0.04em" }}>
            o continúa con
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          id="login-google"
          onClick={handleGoogleLogin}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "0.75rem",
            borderRadius: "0.75rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.18)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>

        {/* Register link */}
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)" }}>
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fb923c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
          >
            Regístrate gratis
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
