'use client'
/**
 * @fileoverview Testimonials — BB Wings Management System
 * @description Sección de testimoniales con carrusel animado automático.
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    id: 1,
    nombre: "María García",
    ciudad: "CDMX",
    rating: 5,
    texto: "Las mejores alitas que he probado en mi vida. El sabor mango habanero es una experiencia única. ¡Imposible comer solo unas pocas!",
    orden: "Alitas Mango Habanero × 20",
    avatar: "MG",
    color: "#ea580c",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    ciudad: "Guadalajara",
    rating: 5,
    texto: "Pedí el combo familiar para mi cumpleaños y todos quedaron impresionados. La calidad es increíble y el servicio es rápido.",
    orden: "Combo Familiar × 1",
    avatar: "CM",
    color: "#facc15",
  },
  {
    id: 3,
    nombre: "Andrea López",
    ciudad: "Monterrey",
    rating: 5,
    texto: "El programa de puntos es genial. Ya canjié mis puntos por una orden gratis. ¡Definitivamente mi restaurante favorito!",
    orden: "Alitas BBQ × 12",
    avatar: "AL",
    color: "#4ade80",
  },
  {
    id: 4,
    nombre: "Roberto Sánchez",
    ciudad: "Puebla",
    rating: 4,
    texto: "El sabor Buffalo es auténtico, picante en su punto. Los nachos supremos son un must. Siempre volvemos con la familia.",
    orden: "Alitas Buffalo × 16",
    avatar: "RS",
    color: "#22d3ee",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => { clearInterval(timer); };
  }, []);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const goNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const active = TESTIMONIALS[activeIndex];
  if (!active) return null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>

      {/* Main card */}
      <div
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "1.75rem",
          padding: "3rem",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Decorative quote mark */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "2rem",
            fontSize: "8rem",
            lineHeight: 1,
            color: "rgba(234,88,12,0.08)",
            fontFamily: "Georgia, serif",
            fontWeight: 900,
            userSelect: "none",
          }}
        >
          ❝
        </div>

        {/* Accent line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "2.5rem",
            width: "60px",
            height: "3px",
            background: `linear-gradient(90deg, ${active.color}, transparent)`,
            borderRadius: "0 0 3px 3px",
            transition: "background 0.4s ease",
          }}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {/* Stars */}
            <div
              style={{ display: "flex", gap: "4px", marginBottom: "1.5rem" }}
              aria-label={`Calificación: ${active.rating} de 5 estrellas`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  style={{ width: "20px", height: "20px" }}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={i < active.rating ? "#facc15" : "none"}
                    stroke={i < active.rating ? "#facc15" : "rgba(255,255,255,0.15)"}
                    strokeWidth="1.5"
                  />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <blockquote
              style={{
                fontSize: "1.1rem",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.85)",
                marginBottom: "2rem",
                flex: 1,
                fontStyle: "italic",
              }}
            >
              &ldquo;{active.texto}&rdquo;
            </blockquote>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Avatar */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${active.color}33, ${active.color}15)`,
                  border: `1px solid ${active.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: active.color,
                  }}
                >
                  {active.avatar}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                  {active.nombre}
                </p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                  {active.ciudad}
                </p>
              </div>

              <span
                style={{
                  fontSize: "0.7rem",
                  color: "rgba(255,255,255,0.35)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                }}
              >
                {active.orden}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {/* Prev */}
        <button
          onClick={goPrev}
          aria-label="Testimonio anterior"
          style={{
            padding: "8px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.15)";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.08)";
            el.style.color = "rgba(255,255,255,0.45)";
          }}
        >
          <ChevronLeft style={{ width: "18px", height: "18px" }} />
        </button>

        {/* Dots */}
        <div style={{ display: "flex", gap: "8px" }} role="tablist" aria-label="Testimoniales">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Testimonio ${i + 1}`}
              onClick={() => { goTo(i); }}
              style={{
                height: "10px",
                width: i === activeIndex ? "32px" : "10px",
                borderRadius: "999px",
                background: i === activeIndex ? active.color : "rgba(255,255,255,0.18)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={goNext}
          aria-label="Testimonio siguiente"
          style={{
            padding: "8px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.15)";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.04)";
            el.style.borderColor = "rgba(255,255,255,0.08)";
            el.style.color = "rgba(255,255,255,0.45)";
          }}
        >
          <ChevronRight style={{ width: "18px", height: "18px" }} />
        </button>
      </div>
    </div>
  );
}

