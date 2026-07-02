'use client'
/**
 * @fileoverview Testimonials — BB Wings Management System
 * @description Sección de testimoniales con carrusel animado automático.
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

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
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    ciudad: "Guadalajara",
    rating: 5,
    texto: "Pedí el combo familiar para mi cumpleaños y todos quedaron impresionados. La calidad es increíble y el servicio es rápido.",
    orden: "Combo Familiar × 1",
    avatar: "CM",
  },
  {
    id: 3,
    nombre: "Andrea López",
    ciudad: "Monterrey",
    rating: 5,
    texto: "El programa de puntos es genial. Ya canjié mis puntos por una orden gratis. ¡Definitivamente mi restaurante favorito!",
    orden: "Alitas BBQ × 12",
    avatar: "AL",
  },
  {
    id: 4,
    nombre: "Roberto Sánchez",
    ciudad: "Puebla",
    rating: 4,
    texto: "El sabor Buffalo es auténtico, picante en su punto. Los nachos supremos son un must. Siempre volvemos con la familia.",
    orden: "Alitas Buffalo × 16",
    avatar: "RS",
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
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Main testimonial */}
      <div className="glass-card rounded-3xl p-8 md:p-12 relative min-h-[280px] flex flex-col">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6" aria-label={`Calificación: ${active.rating} de 5 estrellas`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < active.rating ? "text-secondary fill-secondary" : "text-gray-muted"}`}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-lg md:text-xl text-white leading-relaxed mb-6 flex-1">
              &ldquo;{active.texto}&rdquo;
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{active.avatar}</span>
              </div>
              <div>
                <p className="font-semibold text-white font-ui">{active.nombre}</p>
                <p className="text-sm text-gray-muted">{active.ciudad}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-gray-muted bg-white/5 px-3 py-1.5 rounded-full">
                  {active.orden}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={goPrev}
          aria-label="Testimonio anterior"
          className="p-2 rounded-full glass border border-white/10 text-gray-muted hover:text-white hover:border-white/20 transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2" role="tablist" aria-label="Testimoniales">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Testimonio ${i + 1}`}
              onClick={() => { goTo(i); }}
              className={`transition-all duration-300 rounded-full ${
                i === activeIndex
                  ? "w-8 h-2.5 bg-primary"
                  : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          aria-label="Testimonio siguiente"
          className="p-2 rounded-full glass border border-white/10 text-gray-muted hover:text-white hover:border-white/20 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
