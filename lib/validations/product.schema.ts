/**
 * @fileoverview Product Validation Schemas — BB Wings Management System
 * @description Esquemas Zod para gestión administrativa de productos,
 * categorías e inventario.
 * @version 1.0.0
 */

import { z } from "zod";

// ─── Category Schema ──────────────────────────────────────────────────────

export const categorySchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede exceder 80 caracteres")
    .trim(),
  descripcion: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones"
    )
    .optional(),
  orden: z.number().int().min(0).optional().default(0),
  activa: z.boolean().optional().default(true),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Product Schema ───────────────────────────────────────────────────────

export const productSchema = z.object({
  categoriaId: z
    .number()
    .int("Selecciona una categoría válida")
    .positive("Selecciona una categoría"),
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede exceder 120 caracteres")
    .trim(),
  descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  precio: z
    .number()
    .min(0.01, "El precio debe ser mayor a 0")
    .max(99999.99, "El precio no puede exceder 99,999.99")
    .multipleOf(0.01, "El precio debe tener máximo 2 decimales"),
  precioCosto: z
    .number()
    .min(0, "El precio de costo no puede ser negativo")
    .max(99999.99)
    .optional(),
  sku: z
    .string()
    .max(50, "El SKU no puede exceder 50 caracteres")
    .regex(
      /^[A-Z0-9-_]+$/,
      "El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos"
    )
    .optional()
    .or(z.literal("")),
  codigoBarras: z
    .string()
    .max(30, "El código de barras no puede exceder 30 caracteres")
    .optional()
    .or(z.literal("")),
  calorias: z
    .number()
    .int("Las calorías deben ser un número entero")
    .min(0, "Las calorías no pueden ser negativas")
    .max(9999, "Las calorías no pueden exceder 9999")
    .optional(),
  esNuevo: z.boolean().optional().default(false),
  esPopular: z.boolean().optional().default(false),
  esVegetariano: z.boolean().optional().default(false),
  esPicante: z.boolean().optional().default(false),
  nivelPicante: z
    .number()
    .int()
    .min(1, "El nivel mínimo es 1")
    .max(5, "El nivel máximo es 5")
    .optional(),
  tiempoPreparacion: z
    .number()
    .int("El tiempo debe ser un número entero")
    .min(1, "El tiempo mínimo es 1 minuto")
    .max(180, "El tiempo máximo es 180 minutos")
    .optional(),
  orden: z.number().int().min(0).optional().default(0),
  estado: z.enum(["activo", "inactivo", "agotado"]).optional().default("activo"),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ─── Inventory Schema ─────────────────────────────────────────────────────

export const inventorySchema = z.object({
  productoId: z
    .number()
    .int()
    .positive("Selecciona un producto"),
  proveedorId: z.number().int().positive().optional(),
  cantidadActual: z
    .number()
    .min(0, "La cantidad actual no puede ser negativa")
    .max(999999, "Cantidad máxima excedida"),
  cantidadMinima: z
    .number()
    .min(0, "La cantidad mínima no puede ser negativa")
    .max(999999, "Cantidad máxima excedida"),
  cantidadMaxima: z
    .number()
    .min(0, "La cantidad máxima no puede ser negativa")
    .max(999999, "Cantidad máxima excedida")
    .optional(),
  unidad: z
    .string()
    .min(1, "La unidad es requerida")
    .max(20, "La unidad no puede exceder 20 caracteres"),
  ubicacion: z
    .string()
    .max(100, "La ubicación no puede exceder 100 caracteres")
    .optional(),
  lote: z
    .string()
    .max(50, "El lote no puede exceder 50 caracteres")
    .optional(),
  fechaVencimiento: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return new Date(val) > new Date();
    }, "La fecha de vencimiento debe ser en el futuro"),
  costoUnitario: z
    .number()
    .min(0, "El costo no puede ser negativo")
    .max(99999.99)
    .optional(),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;

// ─── Movement Schema ──────────────────────────────────────────────────────

export const movementSchema = z.object({
  inventarioId: z.number().int().positive("Selecciona un inventario"),
  tipo: z.enum(["entrada", "salida", "ajuste", "merma"], {
    message: "Selecciona un tipo de movimiento válido",
  }),
  cantidad: z
    .number()
    .min(0.001, "La cantidad debe ser mayor a 0")
    .max(999999, "Cantidad máxima excedida"),
  motivo: z
    .string()
    .min(3, "El motivo debe tener al menos 3 caracteres")
    .max(300, "El motivo no puede exceder 300 caracteres"),
  costoUnitario: z
    .number()
    .min(0, "El costo no puede ser negativo")
    .optional(),
});

export type MovementFormValues = z.infer<typeof movementSchema>;

// ─── Promotion Schema ─────────────────────────────────────────────────────

export const promotionSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .trim(),
    descripcion: z
      .string()
      .max(500, "La descripción no puede exceder 500 caracteres")
      .optional(),
    tipo: z.enum(
      ["porcentaje", "monto_fijo", "2x1", "happy_hour", "combo", "evento"],
      { message: "Selecciona un tipo de promoción válido" }
    ),
    valor: z
      .number()
      .min(0, "El valor no puede ser negativo")
      .max(100, "El porcentaje máximo es 100"),
    fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
    fechaFin: z.string().optional(),
    horaInicio: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:MM")
      .optional(),
    horaFin: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato HH:MM")
      .optional(),
    diasSemana: z.array(z.number().int().min(0).max(6)).optional(),
    limiteUso: z
      .number()
      .int()
      .min(1, "El límite de uso mínimo es 1")
      .optional(),
    minimoCompra: z
      .number()
      .min(0, "El mínimo de compra no puede ser negativo")
      .optional(),
    activa: z.boolean().optional().default(true),
  })
  .refine(
    (data) => {
      if (data.fechaFin) {
        return new Date(data.fechaFin) > new Date(data.fechaInicio);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["fechaFin"],
    }
  );

export type PromotionFormValues = z.infer<typeof promotionSchema>;
