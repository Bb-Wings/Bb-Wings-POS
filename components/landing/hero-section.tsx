'use client'
/**
 * @fileoverview Hero Section — BB Wings Management System
 * @description Sección hero de la landing page con animaciones premium,
 * video de fondo opcional, CTA y estadísticas.
 * @version 1.0.0
 */

import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, MapPin, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Animation Variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any },
  },
};

// ─── Stats Data ───────────────────────────────────────────────────────────

const STATS = [
  { value: "15+",    label: "Sabores únicos",    icon: <Flame className="h-4 w-4" /> },
  { value: "4.9★",  label: "Calificación",       icon: <Star className="h-4 w-4" /> },
  { value: "25min", label: "Tiempo de entrega",  icon: <Clock className="h-4 w-4" /> },
  { value: "3",     label: "Sucursales",         icon: <MapPin className="h-4 w-4" /> },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section
      className="relative min-h-[calc(100vh-var(--nav-height))] flex items-center overflow-hidden"
      aria-label="Bienvenida a BB Wings"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-dark" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(214, 31, 44, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(244, 180, 0, 0.08) 0%, transparent 60%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Decorative orbs */}
      <motion.div
        className="absolute right-[10%] top-[20%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(214,31,44,0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="container-app relative z-10 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column — Text content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Tag line */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary text-sm font-medium font-ui mb-6">
                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                El Sabor que te Vuela
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-[clamp(4rem,8vw,7rem)] leading-none text-white mb-6"
            >
              LAS{" "}
              <span className="gradient-text-primary">MEJORES</span>
              <br />
              ALITAS
              <br />
              DE LA CIUDAD
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-gray-muted text-xl leading-relaxed mb-8 max-w-md"
            >
              Más de 15 sabores únicos preparados al momento. Desde las más
              suaves hasta las que te hacen llorar de emoción.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="hover:shadow-glow-primary"
                onClick={() => { window.location.href = "/menu"; }}
              >
                Ordenar Ahora
              </Button>
              <Button
                variant="glass"
                size="lg"
                onClick={() => { window.location.href = "/reservas"; }}
              >
                Reservar Mesa
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="text-center p-3 glass rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold font-heading text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-muted font-ui">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column — Visual */}
          <motion.div
            className="hidden lg:flex items-center justify-center relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            {/* Glowing ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-[400px] h-[400px] rounded-full border border-primary/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-[350px] h-[350px] rounded-full border border-primary/5"
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Hero image placeholder — se reemplaza con imagen real */}
            <div className="relative z-10 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 border border-white/5 flex items-center justify-center">
              <div className="text-center">
                <Flame className="h-24 w-24 text-primary mx-auto mb-4 opacity-60" />
                <p className="text-white/40 text-sm font-ui">
                  Imagen del producto
                </p>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              className="absolute top-8 right-0 glass border border-white/10 rounded-2xl p-4 shadow-glass"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">4.9/5.0</p>
                  <p className="text-[10px] text-gray-muted">2,847 reseñas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-0 glass border border-white/10 rounded-2xl p-4 shadow-glass"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <p className="text-[10px] text-gray-muted font-ui mb-1">
                Pedido entregado 🎉
              </p>
              <p className="text-xs font-bold text-white">
                Alitas BBQ × 20
              </p>
              <p className="text-[10px] text-success mt-0.5">En 22 minutos</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        aria-hidden="true"
      >
        <span className="text-xs text-gray-muted font-ui">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-gray-muted to-transparent"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
