/**
 * @fileoverview Landing Page — BB Wings Management System
 * @description Página principal pública de BB Wings. Incluye Hero animado,
 * sección de promociones, preview del menú, programa de puntos y CTA.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { PromotionsSection } from "@/components/landing/promotions-section";
import { MenuPreview } from "@/components/landing/menu-preview";
import { Testimonials } from "@/components/landing/testimonials";
import { LoyaltySection } from "@/components/landing/loyalty-section";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { ProductCardSkeleton } from "@/components/ui/skeleton";

// ─── Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "BB Wings — Las Mejores Alitas de la Ciudad",
  description:
    "Descubre el sabor que te vuela. Las mejores alitas con más de 15 sabores únicos, programa de puntos y entrega a domicilio.",
};

// ─── Data Fetching ─────────────────────────────────────────────────────────

async function getPromociones() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promociones")
    .select("*")
    .eq("activa", true)
    .order("created_at", { ascending: false })
    .limit(4);
  return data ?? [];
}

async function getProductosPopulares() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("productos")
    .select(`
      *,
      categorias (nombre),
      calificaciones (calificacion)
    `)
    .eq("es_popular", true)
    .eq("disponible", true)
    .order("orden", { ascending: true })
    .limit(8);
  return data ?? [];
}

// ─── Suspense Wrappers ─────────────────────────────────────────────────────

async function PromocionesSuspense() {
  const promociones = await getPromociones();
  return <PromotionsSection promociones={promociones} />;
}

async function MenuPreviewSuspense() {
  const productos = await getProductosPopulares();
  return <MenuPreview productos={productos} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* Hero Section — Animado con Framer Motion */}
        <HeroSection />

        {/* Promociones — Cargadas desde Supabase */}
        <section
          id="promociones"
          aria-labelledby="promociones-title"
          className="py-28 bg-dark"
        >
          <div className="container-app">
            <div className="text-center mb-16">
              <span className="inline-block text-primary font-ui text-sm font-semibold tracking-widest uppercase mb-4">🔥 Ofertas Activas</span>
              <h2
                id="promociones-title"
                className="font-display text-5xl md:text-6xl text-white mb-4"
              >
                PROMOCIONES
              </h2>
              <p className="text-gray-muted text-lg max-w-xl mx-auto">
                Ofertas especiales que no querrás perderte
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <PromocionesSuspense />
            </Suspense>
          </div>
        </section>

        {/* Menú Preview */}
        <section
          id="menu"
          aria-labelledby="menu-title"
          className="py-28 bg-[#0d0d0d]"
        >
          <div className="container-app">
            <div className="text-center mb-16">
              <span className="inline-block text-secondary font-ui text-sm font-semibold tracking-widest uppercase mb-4">🍗 Lo más pedido</span>
              <h2
                id="menu-title"
                className="font-display text-5xl md:text-6xl text-white mb-4"
              >
                NUESTRO MENÚ
              </h2>
              <p className="text-gray-muted text-lg max-w-xl mx-auto">
                Los sabores más populares de BB Wings
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <MenuPreviewSuspense />
            </Suspense>
          </div>
        </section>

        {/* Programa de Puntos */}
        <LoyaltySection />

        {/* Testimonials */}
        <section
          id="testimoniales"
          aria-labelledby="testimoniales-title"
          className="py-28 bg-dark"
        >
          <div className="container-app">
            <div className="text-center mb-16">
              <span className="inline-block text-primary font-ui text-sm font-semibold tracking-widest uppercase mb-4">💬 Opiniones reales</span>
              <h2
                id="testimoniales-title"
                className="font-display text-5xl md:text-6xl text-white mb-4"
              >
                LO QUE DICEN
              </h2>
              <p className="text-gray-muted text-lg max-w-xl mx-auto">
                Miles de clientes felices nos respaldan
              </p>
            </div>
            <Testimonials />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
