/**
 * @fileoverview Validation Schemas — BB Wings Management System
 * @description Esquemas Zod para validación de formularios de autenticación.
 * Centraliza las reglas de validación para reutilización en cliente y servidor.
 * @version 1.0.0
 */

import { z } from "zod";

// ─── Field Rules ──────────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(100, "La contraseña no puede exceder 100 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
  );

const emailSchema = z
  .string()
  .min(1, "El correo electrónico es requerido")
  .email("Ingresa un correo electrónico válido")
  .max(255, "El correo no puede exceder 255 caracteres")
  .toLowerCase()
  .trim();

const phoneSchema = z
  .string()
  .regex(
    /^(\+52|52)?[\s-]?(\d{2,3})[\s-]?(\d{3,4})[\s-]?(\d{4})$/,
    "Ingresa un número de teléfono válido (formato mexicano)"
  )
  .optional()
  .or(z.literal(""));

// ─── Login Schema ─────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .max(100, "La contraseña es demasiado larga"),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register Schema ──────────────────────────────────────────────────────

export const registerSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El nombre solo puede contener letras")
      .trim(),
    apellido: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no puede exceder 50 caracteres")
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, "El apellido solo puede contener letras")
      .trim(),
    email: emailSchema,
    telefono: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ─── Forgot Password Schema ───────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ─── Reset Password Schema ────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
    token: z.string().min(1, "Token requerido"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ─── Change Password Schema ───────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// ─── Update Profile Schema ────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .trim(),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .trim(),
  telefono: phoneSchema,
  fechaNacimiento: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      const minAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
      const maxAge = new Date(now.getFullYear() - 12, now.getMonth(), now.getDate());
      return date >= minAge && date <= maxAge;
    }, "Fecha de nacimiento no válida"),
  direccion: z.string().max(200, "La dirección no puede exceder 200 caracteres").optional(),
  ciudad: z.string().max(100, "La ciudad no puede exceder 100 caracteres").optional(),
  colonia: z.string().max(100, "La colonia no puede exceder 100 caracteres").optional(),
  cp: z
    .string()
    .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
