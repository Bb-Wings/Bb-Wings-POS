/**
 * @fileoverview Currency & Number Formatters — BB Wings Management System
 * @description Utilidades para formateo de moneda, números, fechas y textos.
 * Configurado para México (es-MX, MXN).
 * @version 1.0.0
 */

// ─── Currency Formatters ───────────────────────────────────────────────────

const mxnFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("es-MX", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/**
 * Formatea un número como moneda mexicana.
 * @example formatCurrency(1500) → "$1,500.00"
 */
export function formatCurrency(amount: number): string {
  return mxnFormatter.format(amount);
}

/**
 * Formatea un número como moneda compacta.
 * @example formatCompactCurrency(1500000) → "$1.5M"
 */
export function formatCompactCurrency(amount: number): string {
  return `$${compactFormatter.format(amount)}`;
}

/**
 * Formatea un porcentaje.
 * @example formatPercent(15.5) → "15.5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calcula y formatea el cambio de caja.
 */
export function calculateChange(total: number, received: number): number {
  return Math.max(0, Math.round((received - total) * 100) / 100);
}

// ─── Date Formatters ──────────────────────────────────────────────────────

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/**
 * Formatea una fecha en formato largo.
 * @example formatDate("2024-01-15") → "15 de enero de 2024"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFormatter.format(d);
}

/**
 * Formatea una fecha en formato corto.
 * @example formatShortDate("2024-01-15") → "15/01/2024"
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return shortDateFormatter.format(d);
}

/**
 * Formatea solo la hora.
 * @example formatTime("2024-01-15T14:30:00") → "2:30 p.m."
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return timeFormatter.format(d);
}

/**
 * Formatea fecha y hora.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateTimeFormatter.format(d);
}

/**
 * Formatea el tiempo relativo (hace X tiempo).
 * @example formatRelativeTime("2024-01-15T10:00:00") → "hace 2 horas"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });

  if (diffSecs < 60)   return rtf.format(-diffSecs, "second");
  if (diffMins < 60)   return rtf.format(-diffMins, "minute");
  if (diffHours < 24)  return rtf.format(-diffHours, "hour");
  if (diffDays < 30)   return rtf.format(-diffDays, "day");
  return formatDate(d);
}

/**
 * Formatea duración en minutos a texto legible.
 * @example formatDuration(75) → "1h 15min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// ─── Text Formatters ──────────────────────────────────────────────────────

/**
 * Genera un slug a partir de un texto.
 * @example slugify("Alitas BBQ") → "alitas-bbq"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover tildes
    .replace(/[^a-z0-9\s-]/g, "")    // Remover caracteres especiales
    .replace(/\s+/g, "-")            // Espacios → guiones
    .replace(/-+/g, "-")             // Múltiples guiones → uno
    .trim()
    .replace(/^-|-$/g, "");          // Remover guiones al inicio/fin
}

/**
 * Trunca un texto a una longitud máxima.
 * @example truncate("Texto muy largo...", 20) → "Texto muy largo..."
 */
export function truncate(text: string, maxLength: number, ellipsis = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitaliza la primera letra de cada palabra.
 * @example titleCase("alitas bbq picante") → "Alitas Bbq Picante"
 */
export function titleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

/**
 * Formatea un nombre completo.
 */
export function formatFullName(nombre: string, apellido: string): string {
  return `${titleCase(nombre)} ${titleCase(apellido)}`.trim();
}

/**
 * Formatea un número de orden con padding.
 * @example formatOrderNumber(42) → "#00042"
 */
export function formatOrderNumber(id: number): string {
  return `#${String(id).padStart(5, "0")}`;
}

/**
 * Oculta parte de una cadena (para tarjetas, emails, etc.)
 * @example maskEmail("usuario@gmail.com") → "us***@gmail.com"
 */
export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}***@${domain}`;
}

// ─── Number Formatters ────────────────────────────────────────────────────

/**
 * Formatea un número con separadores de miles.
 * @example formatNumber(1500000) → "1,500,000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

/**
 * Clamps un número entre un mínimo y máximo.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calcula el porcentaje de cambio entre dos valores.
 * @example calculateGrowth(120, 100) → 20
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
