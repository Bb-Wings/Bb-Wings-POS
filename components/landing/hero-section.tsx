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
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ─── Stats Data ───────────────────────────────────────────────────────────

const STATS = [
  { value: "15+",    label: "Sabores únicos",   icon: <Flame className="h-4 w-4" />,   color: "#ea580c" },
  { value: "4.9★",  label: "Calificación",      icon: <Star  className="h-4 w-4" />,   color: "#facc15" },
  { value: "25min", label: "Tiempo de entrega", icon: <Clock className="h-4 w-4" />,   color: "#22d3ee" },
  { value: "3",     label: "Sucursales",        icon: <MapPin className="h-4 w-4" />,  color: "#4ade80" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section
      aria-label="Bienvenida a BB Wings"
      style={{
        position: "relative",
        minHeight: "calc(100vh - var(--nav-height, 64px))",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      {/* ── Background layers ── */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Primary red/orange blob left */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "-5%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(ellipse, rgba(214,31,44,0.12) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Gold accent top-right */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(ellipse, rgba(244,180,0,0.07) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Bottom-right accent */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "-5%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(234,88,12,0.06) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Horizontal divider glow at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(234,88,12,0.3), transparent)",
          }}
        />
      </div>

      {/* Animated pulsing orb */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "8%",
          top: "15%",
          width: "560px",
          height: "560px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(214,31,44,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Content ── */}
      <div className="container-app" style={{ position: "relative", zIndex: 10, paddingTop: "4rem", paddingBottom: "4rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          {/* Left — Text */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">

            {/* Tag pill */}
            <motion.div variants={itemVariants}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: "rgba(234,88,12,0.1)",
                  border: "1px solid rgba(234,88,12,0.3)",
                  color: "#f97316",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  marginBottom: "1.5rem",
                }}
              >
                <Flame style={{ width: "14px", height: "14px" }} aria-hidden="true" />
                El Sabor que te Vuela
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                lineHeight: 0.95,
                color: "#fff",
                marginBottom: "1.5rem",
                fontFamily: "var(--font-display, inherit)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              LAS{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #d61f2c, #ea580c, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MEJORES
              </span>
              <br />
              ALITAS
              <br />
              DE LA CIUDAD
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "1.15rem",
                lineHeight: 1.75,
                marginBottom: "2.25rem",
                maxWidth: "440px",
              }}
            >
              Más de 15 sabores únicos preparados al momento. Desde las más
              suaves hasta las que te hacen llorar de emoción.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "3rem" }}
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
              style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}
            >
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  style={{
                    textAlign: "center",
                    padding: "1rem 0.5rem",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "1rem",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "6px",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <p
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1,
                      marginBottom: "4px",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      color: "rgba(255,255,255,0.4)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            aria-hidden="true"
            className="hidden lg:flex"
            style={{ alignItems: "center", justifyContent: "center", position: "relative" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Rotating rings */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <motion.div
                style={{
                  width: "440px",
                  height: "440px",
                  borderRadius: "50%",
                  border: "1px solid rgba(214,31,44,0.12)",
                  position: "absolute",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                style={{
                  width: "360px",
                  height: "360px",
                  borderRadius: "50%",
                  border: "1px solid rgba(234,88,12,0.08)",
                  position: "absolute",
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                style={{
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  border: "1px dashed rgba(255,255,255,0.05)",
                  position: "absolute",
                }}
                animate={{ rotate: 180 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Central orb */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, rgba(234,88,12,0.25) 0%, rgba(214,31,44,0.1) 50%, rgba(10,10,10,0.8) 100%)",
                border: "1px solid rgba(234,88,12,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 80px rgba(214,31,44,0.12), inset 0 0 60px rgba(234,88,12,0.05)",
              }}
            >
              <Flame
                style={{ width: "80px", height: "80px", color: "#ea580c", opacity: 0.7 }}
              />
            </div>

            {/* Floating card — Rating */}
            <motion.div
              style={{
                position: "absolute",
                top: "10%",
                right: "-2%",
                background: "rgba(15,15,15,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "rgba(74,222,128,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Star style={{ width: "16px", height: "16px", color: "#4ade80" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>4.9 / 5.0</p>
                  <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>2,847 reseñas</p>
                </div>
              </div>
            </motion.div>

            {/* Floating card — Last order */}
            <motion.div
              style={{
                position: "absolute",
                bottom: "10%",
                left: "-2%",
                background: "rgba(15,15,15,0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            >
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                Pedido entregado 🎉
              </p>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Alitas BBQ × 20
              </p>
              <p style={{ fontSize: "0.65rem", color: "#4ade80", marginTop: "4px", fontWeight: 600 }}>
                En 22 minutos ✓
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Scroll
        </span>
        <motion.div
          style={{
            width: "1px",
            height: "36px",
            background: "linear-gradient(to bottom, rgba(234,88,12,0.6), transparent)",
          }}
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
