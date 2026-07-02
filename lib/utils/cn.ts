/**
 * @fileoverview cn Utility — BB Wings Management System
 * @description Combina clsx con tailwind-merge para manejar clases de Tailwind
 * de forma segura sin conflictos. Requerido por todos los componentes UI.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma inteligente.
 * Resuelve conflictos automáticamente (ej: p-2 + p-4 → p-4).
 *
 * @example
 * cn("text-red-500", "text-blue-500") → "text-blue-500"
 * cn("px-2 py-1", isPrimary && "bg-primary") → "px-2 py-1 bg-primary"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
