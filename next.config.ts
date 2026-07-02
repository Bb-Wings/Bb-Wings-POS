/**
 * @fileoverview Next.js Configuration — BB Wings Management System
 * @description Configuración de producción de Next.js con optimizaciones de imagen,
 * headers de seguridad, soporte PWA y configuración de dominios externos.
 * @version 1.0.0
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Experimental Features ────────────────────────────────────────────────
  experimental: {
    // Server Actions ya están habilitadas por defecto en Next.js 15+
    // Configuramos el límite de tamaño del cuerpo de la petición
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  // ─── Image Configuration ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabase Storage (legacy)
      {
        protocol: "https",
        hostname: "*.supabase.in",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Placeholders de desarrollo
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ─── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Previene clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Previene MIME sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://picsum.photos https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:8080 http://localhost:3001",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      // Headers CORS para la API interna
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-CSRF-Token",
          },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirige /admin al dashboard de admin
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    // Se recomienda resolver todos los errores en producción
    ignoreBuildErrors: false,
  },

  // ─── Output ───────────────────────────────────────────────────────────────
  // Descomenta para exportación estática:
  // output: "standalone",

  // ─── Compiler Options ─────────────────────────────────────────────────────
  compiler: {
    // Remueve console.log en producción (excepto errors y warns)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // ─── Powered By Header ────────────────────────────────────────────────────
  poweredByHeader: false,

  // ─── Logging ─────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
