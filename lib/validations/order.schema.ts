/**
 * @fileoverview Order Validation Schemas — BB Wings Management System
 * @description Esquemas Zod para validación de pedidos, checkout y reservas.
 * @version 1.0.0
 */

import { z } from "zod";

// ─── Order Item Schema ────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productoId: z
    .number()
    .int("El ID del producto debe ser un entero")
    .positive("El ID del producto debe ser positivo"),
  cantidad: z
    .number()
    .int("La cantidad debe ser un entero")
    .min(1, "La cantidad mínima es 1")
    .max(99, "La cantidad máxima es 99"),
  notas: z
    .string()
    .max(200, "Las notas no pueden exceder 200 caracteres")
    .optional(),
  modificadores: z.record(z.string(), z.unknown()).optional(),
});

export type OrderItemFormValues = z.infer<typeof orderItemSchema>;

// ─── Checkout Schema ──────────────────────────────────────────────────────

export const checkoutSchema = z
  .object({
    tipo: z.enum(["local", "para_llevar", "delivery", "drive_thru"], {
      message: "Selecciona un tipo de pedido válido",
    }),
    // Dirección de entrega — requerida solo para delivery
    direccionEntrega: z
      .string()
      .max(300, "La dirección no puede exceder 300 caracteres")
      .optional(),
    notas: z
      .string()
      .max(500, "Las notas no pueden exceder 500 caracteres")
      .optional(),
    cuponCodigo: z
      .string()
      .max(50, "El código de cupón no puede exceder 50 caracteres")
      .optional(),
    mesaNumero: z
      .string()
      .max(10, "El número de mesa no puede exceder 10 caracteres")
      .optional(),
    personas: z
      .number()
      .int()
      .min(1, "El número de personas mínimo es 1")
      .max(50, "El número de personas máximo es 50")
      .optional(),
    metodoPago: z.enum(
      ["efectivo", "tarjeta_credito", "tarjeta_debito", "transferencia", "qr", "puntos"],
      { message: "Selecciona un método de pago válido" }
    ),
  })
  .refine(
    (data) => {
      // La dirección es requerida para delivery
      if (data.tipo === "delivery") {
        return (data.direccionEntrega?.trim().length ?? 0) > 0;
      }
      return true;
    },
    {
      message: "La dirección de entrega es requerida para pedidos a domicilio",
      path: ["direccionEntrega"],
    }
  );

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ─── Coupon Validation Schema ─────────────────────────────────────────────

export const couponSchema = z.object({
  codigo: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .toUpperCase()
    .trim(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;

// ─── Reservation Schema ───────────────────────────────────────────────────

export const reservationSchema = z
  .object({
    nombreContacto: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .trim(),
    telefonoContacto: z
      .string()
      .regex(
        /^(\+52|52)?[\s-]?(\d{2,3})[\s-]?(\d{3,4})[\s-]?(\d{4})$/,
        "Ingresa un número de teléfono válido"
      ),
    emailContacto: z
      .string()
      .email("Ingresa un correo válido")
      .optional()
      .or(z.literal("")),
    fecha: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "La fecha de reserva debe ser hoy o en el futuro"),
    hora: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Ingresa una hora válida (HH:MM)"),
    personas: z
      .number()
      .int("El número de personas debe ser un entero")
      .min(1, "Mínimo 1 persona")
      .max(50, "Máximo 50 personas por reserva"),
    notas: z
      .string()
      .max(500, "Las notas no pueden exceder 500 caracteres")
      .optional(),
  })
  .refine(
    (data) => {
      // No permitir reservas en el pasado (mismo día, hora pasada)
      const fechaHora = new Date(`${data.fecha}T${data.hora}:00`);
      return fechaHora > new Date();
    },
    {
      message: "La fecha y hora de reserva debe ser en el futuro",
      path: ["hora"],
    }
  );

export type ReservationFormValues = z.infer<typeof reservationSchema>;

// ─── Rating Schema ────────────────────────────────────────────────────────

export const ratingSchema = z.object({
  productoId: z.number().int().positive(),
  pedidoId: z.number().int().positive().optional(),
  calificacion: z
    .number()
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),
  categoria: z.enum(["sabor", "servicio", "tiempo", "limpieza", "general"]),
  comentario: z
    .string()
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .optional(),
});

export type RatingFormValues = z.infer<typeof ratingSchema>;
