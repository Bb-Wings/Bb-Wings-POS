'use client'
/**
 * @fileoverview Auth Layout — BB Wings Management System
 * @description Layout para páginas de autenticación. Panel decorativo izquierdo
 * con marca, estadísticas y fondo premium. Panel derecho con formulario.
 * @version 2.0.0
 */

import Link from "next/link";
import { Flame, Star, Clock, Users } from "lucide-react";

// ─── Copyright (client-only to avoid hydration mismatch) ─────────────────

function Copyright() {
  return (
    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
      © {new Date().getFullYear()} BB Wings. Todos los derechos reservados.
    </p>
  );
}

// ─── Left Panel Stats ─────────────────────────────────────────────────────

const STATS = [
  { value: "50K+",  label: "Clientes",     icon: <Users  style={{ width: "14px", height: "14px" }} /> },
  { value: "4.9★", label: "Calificación", icon: <Star   style={{ width: "14px", height: "14px" }} /> },
  { value: "15+",  label: "Sabores",       icon: <Clock  style={{ width: "14px", height: "14px" }} /> },
];

// ─── Layout ───────────────────────────────────────────────────────────────

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>

      {/* ── Left Panel — Decorative (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-1/2"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0d0d0d",
          flexDirection: "column",
        }}
        aria-hidden="true"
      >
        {/* Background blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Red blob center-left */}
          <div style={{
            position: "absolute", top: "20%", left: "-10%",
            width: "600px", height: "600px", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(214,31,44,0.14) 0%, transparent 65%)",
          }} />
          {/* Gold blob bottom-right */}
          <div style={{
            position: "absolute", bottom: "10%", right: "-5%",
            width: "400px", height: "400px", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(244,180,0,0.07) 0%, transparent 65%)",
          }} />
          {/* Dots pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          {/* Bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "200px",
            background: "linear-gradient(to top, #0d0d0d, transparent)",
          }} />
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "3rem",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
            }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #d61f2c, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(214,31,44,0.3)",
            }}>
              <Flame style={{ width: "18px", height: "18px", color: "#fff" }} />
            </div>
            <span style={{
              fontFamily: "var(--font-display, inherit)",
              fontSize: "1.35rem",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.12em",
            }}>
              BB WINGS
            </span>
          </Link>

          {/* Main content */}
          <div>
            {/* Heading */}
            <div style={{ marginBottom: "2rem" }}>
              <p style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#ea580c",
                marginBottom: "1rem",
              }}>
                🔥 El restaurante favorito de la ciudad
              </p>
              <h2 style={{
                fontSize: "clamp(3rem, 5vw, 4.5rem)",
                lineHeight: 0.92,
                fontFamily: "var(--font-display, inherit)",
                fontWeight: 900,
                color: "#fff",
                marginBottom: "1.5rem",
              }}>
                EL SABOR<br />
                <span style={{
                  background: "linear-gradient(135deg, #d61f2c, #ea580c, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  QUE TE VUELA
                </span>
              </h2>
              <p style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.45)",
                maxWidth: "340px",
              }}>
                Únete a miles de clientes que disfrutan las mejores alitas
                de la ciudad con nuestro programa de puntos exclusivo.
              </p>
            </div>

            {/* Stats grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
            }}>
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  style={{
                    padding: "1rem 0.75rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "1rem",
                    textAlign: "center",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ea580c", marginBottom: "6px",
                  }}>
                    {stat.icon}
                  </div>
                  <p style={{ fontSize: "1.25rem", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "4px" }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.03em" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <div style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                "✓ Programa de puntos y recompensas",
                "✓ Pedidos en línea y seguimiento en tiempo real",
                "✓ Más de 15 sabores únicos",
              ].map((item) => (
                <p key={item} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <Copyright />
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* Subtle top-right glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(214,31,44,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Mobile logo */}
        <div
          className="lg:hidden"
          style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}
        >
          <Link
            href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #d61f2c, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Flame style={{ width: "16px", height: "16px", color: "#fff" }} />
            </div>
            <span style={{
              fontFamily: "var(--font-display, inherit)",
              fontSize: "1.1rem", fontWeight: 900, color: "#fff", letterSpacing: "0.1em",
            }}>
              BB WINGS
            </span>
          </Link>
        </div>

        {/* Form container */}
        <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
