'use client'
/**
 * @fileoverview Loyalty Section — BB Wings Management System
 * @description Sección de programa de puntos con niveles de fidelidad y CTA.
 * @version 1.0.0
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Gift, Star, ArrowRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "bronce",
    nivel: "Bronce",
    emoji: "🥉",
    pts: "1 pt",
    per: "por cada $10",
    extra: "Nivel de entrada",
    desde: null as number | null,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.25)",
    bg: "rgba(245,158,11,0.07)",
    perks: ["Puntos en cada compra", "Cupones de bienvenida"],
    featured: false,
  },
  {
    id: "plata",
    nivel: "Plata",
    emoji: "🥈",
    pts: "2 pts",
    per: "por cada $10",
    extra: "Desde $500",
    desde: 500 as number | null,
    color: "#d1d5db",
    glow: "rgba(209,213,219,0.12)",
    border: "rgba(209,213,219,0.25)",
    bg: "rgba(209,213,219,0.06)",
    perks: ["Todo Bronce", "Promociones exclusivas"],
    featured: false,
  },
  {
    id: "oro",
    nivel: "Oro",
    emoji: "🥇",
    pts: "3 pts",
    per: "por cada $10",
    extra: "Desde $1,500",
    desde: 1500 as number | null,
    color: "#facc15",
    glow: "rgba(250,204,21,0.15)",
    border: "rgba(250,204,21,0.30)",
    bg: "rgba(250,204,21,0.07)",
    perks: ["Todo Plata", "Descuento de cumpleaños"],
    featured: true,
  },
  {
    id: "platino",
    nivel: "Platino",
    emoji: "💎",
    pts: "5 pts",
    per: "por cada $10",
    extra: "Desde $5,000",
    desde: 5000 as number | null,
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.15)",
    border: "rgba(34,211,238,0.25)",
    bg: "rgba(34,211,238,0.07)",
    perks: ["Todo Oro", "Orden gratis cada mes"],
    featured: false,
  },
];

// ─── Tier Card ─────────────────────────────────────────────────────────────

function TierCard({ tier, index }: { tier: (typeof TIERS)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: `0 8px 40px ${tier.glow}`, transition: { duration: 0.25 } }}
      style={{
        position: "relative",
        borderRadius: "1.5rem",
        padding: tier.featured ? "2.5rem 1.75rem" : "2rem 1.5rem",
        border: `1px solid ${tier.border}`,
        background: tier.bg,
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxShadow: tier.featured ? `0 0 50px ${tier.glow}` : "none",
        transform: tier.featured ? "scale(1.04)" : "scale(1)",
      }}
    >
      {/* Featured badge */}
      {tier.featured && (
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(135deg, ${tier.color}, #f97316)`,
            color: "#000",
            fontSize: "0.65rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          ⭐ Más popular
        </div>
      )}

      {/* Emoji */}
      <div style={{ fontSize: "3.5rem", lineHeight: 1, marginBottom: "1rem" }}>
        {tier.emoji}
      </div>

      {/* Nivel name */}
      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: tier.color,
          marginBottom: "0.75rem",
          letterSpacing: "-0.01em",
        }}
      >
        {tier.nivel}
      </p>

      {/* Divider */}
      <div
        style={{
          width: "40px",
          height: "2px",
          background: tier.color,
          opacity: 0.4,
          borderRadius: "2px",
          marginBottom: "1rem",
        }}
      />

      {/* Points */}
      <div style={{ marginBottom: "0.75rem" }}>
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {tier.pts}
        </span>
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
          {tier.per}
        </p>
      </div>

      {/* Perks */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0.75rem 0 1rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {tier.perks.map((perk) => (
          <li
            key={perk}
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              justifyContent: "center",
            }}
          >
            <span style={{ color: tier.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
            {perk}
          </li>
        ))}
      </ul>

      {/* Desde label */}
      {tier.desde !== null ? (
        <p
          style={{
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.3)",
            marginTop: "auto",
            paddingTop: "0.5rem",
          }}
        >
          Desde ${tier.desde.toLocaleString('es-MX')} acumulados
        </p>
      ) : (
        <p
          style={{
            fontSize: "0.7rem",
            color: tier.color,
            fontWeight: 600,
            marginTop: "auto",
            paddingTop: "0.5rem",
          }}
        >
          ¡Comienza hoy!
        </p>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function LoyaltySection() {
  const BENEFITS = [
    { icon: <Zap className="h-4 w-4" />, label: "Puntos instantáneos" },
    { icon: <Gift className="h-4 w-4" />, label: "Canjes por productos gratis" },
    { icon: <Star className="h-4 w-4" />, label: "Descuentos exclusivos" },
  ];

  return (
    <section
      id="programa-puntos"
      aria-labelledby="puntos-title"
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "7rem",
        paddingBottom: "7rem",
        background: "linear-gradient(180deg, #0d0d0d 0%, #111111 50%, #0d0d0d 100%)",
      }}
    >
      {/* Decorative background */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {/* Primary orange blob */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "900px",
            background: "radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Gold accent left */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Cyan accent right */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "-80px",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container-app" style={{ position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ textAlign: "center", marginBottom: "3.5rem" }}
          >
            <span
              style={{
                display: "inline-block",
                color: "#ea580c",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "1.25rem",
                padding: "6px 18px",
                background: "rgba(234,88,12,0.1)",
                borderRadius: "999px",
                border: "1px solid rgba(234,88,12,0.2)",
              }}
            >
              ⭐ Programa de Recompensas
            </span>

            <h2
              id="puntos-title"
              className="font-display"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                lineHeight: 1,
                color: "#fff",
                marginBottom: "1.25rem",
                display: "block",
              }}
            >
              PROGRAMA DE{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #ea580c, #f97316, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PUNTOS
              </span>
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "1.05rem",
                maxWidth: "520px",
                margin: "0 auto",
                lineHeight: 1.75,
              }}
            >
              Acumula puntos en cada pedido y canjéalos por productos gratis,
              descuentos exclusivos y experiencias únicas.
            </p>
          </motion.div>

          {/* Benefits strip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2.5rem",
              flexWrap: "wrap",
              marginBottom: "3.5rem",
              paddingBottom: "3rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {BENEFITS.map((b) => (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "rgba(255,255,255,0.55)",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "#ea580c" }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </motion.div>

          {/* Tier cards grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.5rem",
              marginBottom: "4.5rem",
              alignItems: "end",
            }}
          >
            {TIERS.map((tier, i) => (
              <TierCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ textAlign: "center" }}
          >
            {/* Connector line */}
            <div
              style={{
                width: "1px",
                height: "48px",
                background: "linear-gradient(to bottom, transparent, rgba(234,88,12,0.5), transparent)",
                margin: "0 auto 2rem",
              }}
            />

            <Link
              href="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "1.1rem 2.5rem",
                borderRadius: "1rem",
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.05rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "0 0 40px rgba(234,88,12,0.45), 0 8px 24px rgba(234,88,12,0.3)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.boxShadow = "none";
                el.style.transform = "translateY(0)";
              }}
            >
              ¡Únete Gratis!
              <ArrowRight style={{ width: "18px", height: "18px" }} />
            </Link>

            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.8rem",
                marginTop: "1rem",
                letterSpacing: "0.04em",
              }}
            >
              Sin costo · Sin compromisos · Solo beneficios
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
