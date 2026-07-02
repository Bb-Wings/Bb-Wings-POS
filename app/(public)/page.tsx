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
          className="py-20 bg-dark"
        >
          <div className="container-app">
            <div className="text-center mb-12">
              <h2
                id="promociones-title"
                className="font-display text-5xl text-white mb-3"
              >
                PROMOCIONES
              </h2>
              <p className="text-gray-muted text-lg">
                Ofertas especiales que no querrás perderte
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          className="py-20 bg-[#0d0d0d]"
        >
          <div className="container-app">
            <div className="text-center mb-12">
              <h2
                id="menu-title"
                className="font-display text-5xl text-white mb-3"
              >
                NUESTRO MENÚ
              </h2>
              <p className="text-gray-muted text-lg">
                Los sabores más populares de BB Wings
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <section
          id="programa-puntos"
          aria-labelledby="puntos-title"
          className="py-20 gradient-hero relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
          </div>
          <div className="container-app relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2
                id="puntos-title"
                className="font-display text-5xl md:text-7xl text-white mb-6"
              >
                PROGRAMA DE{" "}
                <span className="gradient-text-primary">PUNTOS</span>
              </h2>
              <p className="text-gray-muted text-xl mb-10 max-w-2xl mx-auto">
                Acumula puntos en cada pedido y canjéalos por productos gratis,
                descuentos exclusivos y experiencias únicas.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                {[
                  { nivel: "🥉 Bronce", desc: "Gana 1pt por $10", color: "text-amber-500" },
                  { nivel: "🥈 Plata", desc: "Gana 2pts por $10", color: "text-gray-300" },
                  { nivel: "🥇 Oro", desc: "Gana 3pts por $10", color: "text-yellow-400" },
                  { nivel: "💎 Platino", desc: "Gana 5pts por $10", color: "text-cyan-400" },
                ].map((item) => (
                  <div
                    key={item.nivel}
                    className="glass-card rounded-2xl p-5 text-center"
                  >
                    <p className={`text-lg font-bold font-heading ${item.color}`}>
                      {item.nivel}
                    </p>
                    <p className="text-sm text-gray-muted mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
              <a
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-bold font-ui text-lg hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                ¡Únete Gratis!
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          id="testimoniales"
          aria-labelledby="testimoniales-title"
          className="py-20 bg-dark"
        >
          <div className="container-app">
            <div className="text-center mb-12">
              <h2
                id="testimoniales-title"
                className="font-display text-5xl text-white mb-3"
              >
                LO QUE DICEN
              </h2>
              <p className="text-gray-muted text-lg">
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
