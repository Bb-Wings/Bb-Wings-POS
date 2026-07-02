/**
 * @fileoverview Root Layout — BB Wings Management System
 * @description Layout raíz de la aplicación. Configura proveedores globales,
 * fuentes, metadata SEO, PWA manifest y tema oscuro.
 * @version 1.0.0
 */

import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Oswald, Poppins, Montserrat } from "next/font/google";
import "@/app/globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

// ─── Fonts ─────────────────────────────────────────────────────────────────

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const oswald = Oswald({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
  preload: true,
});

// ─── Metadata & SEO ────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "BB Wings — El Sabor que te Vuela",
    template: "%s | BB Wings",
  },
  description:
    "Las mejores alitas de la ciudad. Ordena en línea, reserva tu mesa y disfruta de sabores únicos con el programa de puntos BB Wings.",
  keywords: [
    "alitas",
    "wings",
    "restaurante",
    "comida rápida",
    "bb wings",
    "order online",
    "reservaciones",
  ],
  authors: [{ name: "BB Wings" }],
  creator: "BB Wings",
  publisher: "BB Wings",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: "BB Wings",
    title: "BB Wings — El Sabor que te Vuela",
    description:
      "Las mejores alitas de la ciudad. Ordena en línea, reserva tu mesa y disfruta de sabores únicos.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BB Wings — El Sabor que te Vuela",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BB Wings — El Sabor que te Vuela",
    description: "Las mejores alitas de la ciudad.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

// ─── Viewport ──────────────────────────────────────────────────────────────

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#101010" },
    { media: "(prefers-color-scheme: light)", color: "#D61F2C" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Root Layout ───────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-MX"
      className={`dark ${bebasNeue.variable} ${oswald.variable} ${poppins.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-dark text-gray font-body antialiased min-h-screen">
        <SupabaseProvider>
          <QueryProvider>
            {children}
            <ToastProvider />
          </QueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
