/**
 * @fileoverview API Endpoints — BB Wings Management System
 * @description Centralización de todos los endpoints del backend C++ (Drogon).
 * Facilita el mantenimiento y refactoring de URLs.
 * @version 1.0.0
 */

// ─── Auth Endpoints ────────────────────────────────────────────────────────

export const AUTH_ENDPOINTS = {
  LOGIN:           "/auth/login",
  REGISTER:        "/auth/register",
  LOGOUT:          "/auth/logout",
  REFRESH:         "/auth/refresh",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD:  "/auth/reset-password",
  VERIFY_EMAIL:    "/auth/verify-email",
  ME:              "/auth/me",
} as const;

// ─── Users Endpoints ──────────────────────────────────────────────────────

export const USER_ENDPOINTS = {
  LIST:            "/users",
  CREATE:          "/users",
  BY_ID:           (id: string) => `/users/${id}`,
  UPDATE:          (id: string) => `/users/${id}`,
  DELETE:          (id: string) => `/users/${id}`,
  AVATAR:          (id: string) => `/users/${id}/avatar`,
  CHANGE_PASSWORD: (id: string) => `/users/${id}/password`,
} as const;

// ─── Products Endpoints ───────────────────────────────────────────────────

export const PRODUCT_ENDPOINTS = {
  LIST:            "/products",
  CREATE:          "/products",
  BY_ID:           (id: number) => `/products/${id}`,
  BY_SLUG:         (slug: string) => `/products/slug/${slug}`,
  UPDATE:          (id: number) => `/products/${id}`,
  DELETE:          (id: number) => `/products/${id}`,
  IMAGES:          (id: number) => `/products/${id}/images`,
  TOGGLE_STATUS:   (id: number) => `/products/${id}/toggle`,
  POPULAR:         "/products/popular",
  SEARCH:          "/products/search",
} as const;

// ─── Categories Endpoints ─────────────────────────────────────────────────

export const CATEGORY_ENDPOINTS = {
  LIST:            "/categories",
  CREATE:          "/categories",
  BY_ID:           (id: number) => `/categories/${id}`,
  BY_SLUG:         (slug: string) => `/categories/slug/${slug}`,
  UPDATE:          (id: number) => `/categories/${id}`,
  DELETE:          (id: number) => `/categories/${id}`,
  WITH_PRODUCTS:   (id: number) => `/categories/${id}/products`,
} as const;

// ─── Orders Endpoints ─────────────────────────────────────────────────────

export const ORDER_ENDPOINTS = {
  LIST:            "/orders",
  CREATE:          "/orders",
  BY_ID:           (id: number) => `/orders/${id}`,
  UPDATE_STATUS:   (id: number) => `/orders/${id}/status`,
  CANCEL:          (id: number) => `/orders/${id}/cancel`,
  MY_ORDERS:       "/orders/my",
  TRACK:           (token: string) => `/orders/track/${token}`,
  INVOICE:         (id: number) => `/orders/${id}/invoice`,
  KITCHEN:         "/orders/kitchen",             // Pedidos para cocina
  PENDING:         "/orders/pending",
} as const;

// ─── Payments Endpoints ───────────────────────────────────────────────────

export const PAYMENT_ENDPOINTS = {
  CREATE:          "/payments",
  BY_ID:           (id: number) => `/payments/${id}`,
  BY_ORDER:        (orderId: number) => `/payments/order/${orderId}`,
  REFUND:          (id: number) => `/payments/${id}/refund`,
} as const;

// ─── Inventory Endpoints ──────────────────────────────────────────────────

export const INVENTORY_ENDPOINTS = {
  LIST:            "/inventory",
  BY_ID:           (id: number) => `/inventory/${id}`,
  UPDATE:          (id: number) => `/inventory/${id}`,
  MOVEMENTS:       "/inventory/movements",
  BY_PRODUCT:      (productId: number) => `/inventory/product/${productId}`,
  LOW_STOCK:       "/inventory/low-stock",
  ALERTS:          "/inventory/alerts",
} as const;

// ─── Reservations Endpoints ───────────────────────────────────────────────

export const RESERVATION_ENDPOINTS = {
  LIST:            "/reservations",
  CREATE:          "/reservations",
  BY_ID:           (id: number) => `/reservations/${id}`,
  UPDATE:          (id: number) => `/reservations/${id}`,
  CANCEL:          (id: number) => `/reservations/${id}/cancel`,
  CONFIRM:         (token: string) => `/reservations/confirm/${token}`,
  AVAILABILITY:    "/reservations/availability",
  MY_RESERVATIONS: "/reservations/my",
} as const;

// ─── Promotions Endpoints ─────────────────────────────────────────────────

export const PROMOTION_ENDPOINTS = {
  LIST:            "/promotions",
  ACTIVE:          "/promotions/active",
  CREATE:          "/promotions",
  BY_ID:           (id: number) => `/promotions/${id}`,
  UPDATE:          (id: number) => `/promotions/${id}`,
  DELETE:          (id: number) => `/promotions/${id}`,
} as const;

// ─── Coupons Endpoints ────────────────────────────────────────────────────

export const COUPON_ENDPOINTS = {
  LIST:            "/coupons",
  CREATE:          "/coupons",
  BY_ID:           (id: number) => `/coupons/${id}`,
  UPDATE:          (id: number) => `/coupons/${id}`,
  DELETE:          (id: number) => `/coupons/${id}`,
  VALIDATE:        "/coupons/validate",
} as const;

// ─── Reports Endpoints ────────────────────────────────────────────────────

export const REPORT_ENDPOINTS = {
  SALES:           "/reports/sales",
  ORDERS:          "/reports/orders",
  INVENTORY:       "/reports/inventory",
  CLIENTS:         "/reports/clients",
  PRODUCTS:        "/reports/products",
  DASHBOARD:       "/reports/dashboard",
  EXPORT_PDF:      (type: string) => `/reports/${type}/export/pdf`,
  EXPORT_CSV:      (type: string) => `/reports/${type}/export/csv`,
} as const;

// ─── Notifications Endpoints ──────────────────────────────────────────────

export const NOTIFICATION_ENDPOINTS = {
  MY_NOTIFICATIONS: "/notifications",
  MARK_READ:        (id: number) => `/notifications/${id}/read`,
  MARK_ALL_READ:    "/notifications/read-all",
  DELETE:           (id: number) => `/notifications/${id}`,
  COUNT_UNREAD:     "/notifications/unread-count",
} as const;

// ─── Clients Endpoints ────────────────────────────────────────────────────

export const CLIENT_ENDPOINTS = {
  LIST:            "/clients",
  BY_ID:           (id: number) => `/clients/${id}`,
  UPDATE:          (id: number) => `/clients/${id}`,
  POINTS:          (id: number) => `/clients/${id}/points`,
  QR:              (id: number) => `/clients/${id}/qr`,
  FAVORITES:       (id: number) => `/clients/${id}/favorites`,
  HISTORY:         (id: number) => `/clients/${id}/history`,
} as const;

// ─── Reviews Endpoints ────────────────────────────────────────────────────

export const REVIEW_ENDPOINTS = {
  BY_PRODUCT:      (productId: number) => `/reviews/product/${productId}`,
  CREATE:          "/reviews",
  DELETE:          (id: number) => `/reviews/${id}`,
  MODERATE:        (id: number) => `/reviews/${id}/moderate`,
} as const;

// ─── Suppliers Endpoints ──────────────────────────────────────────────────

export const SUPPLIER_ENDPOINTS = {
  LIST:            "/suppliers",
  CREATE:          "/suppliers",
  BY_ID:           (id: number) => `/suppliers/${id}`,
  UPDATE:          (id: number) => `/suppliers/${id}`,
  DELETE:          (id: number) => `/suppliers/${id}`,
} as const;

// ─── Audit Endpoints ──────────────────────────────────────────────────────

export const AUDIT_ENDPOINTS = {
  LIST:            "/audit",
  BY_TABLE:        (table: string) => `/audit/${table}`,
  BY_USER:         (userId: string) => `/audit/user/${userId}`,
} as const;

// ─── Health Check ─────────────────────────────────────────────────────────

export const HEALTH_ENDPOINTS = {
  HEALTH:          "/health",
  READY:           "/health/ready",
  METRICS:         "/health/metrics",
} as const;
