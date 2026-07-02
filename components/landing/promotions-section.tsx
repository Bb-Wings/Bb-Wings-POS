'use client'
/**
 * @fileoverview Promotions Section — BB Wings Management System
 * @description Sección de promociones activas en la landing page.
 * Renderizada como Server Component para datos frescos.
 * @version 1.0.0
 */

import Image from "next/image";
import Link from "next/link";
import { Tag, Clock, ArrowRight } from "lucide-react";
import type { DbPromocion } from "@/types/database.types";
import { formatDate } from "@/lib/utils/formatters";

// ─── Types ────────────────────────────────────────────────────────────────

interface PromotionsSectionProps {
  promociones: DbPromocion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const TIPO_LABELS: Record<string, string> = {
  porcentaje:  "Descuento",
  monto_fijo:  "Ahorra",
  "2x1":       "2×1",
  happy_hour:  "Happy Hour",
  combo:       "Combo",
  evento:      "Evento",
};

function getBadgeColor(tipo: string) {
  switch (tipo) {
    case "porcentaje":  return { bg: "rgba(234,88,12,0.9)",  text: "#fff" };
    case "monto_fijo":  return { bg: "rgba(250,204,21,0.9)", text: "#000" };
    case "2x1":         return { bg: "rgba(34,211,238,0.9)", text: "#000" };
    case "happy_hour":  return { bg: "rgba(74,222,128,0.9)", text: "#000" };
    default:            return { bg: "rgba(139,92,246,0.9)", text: "#fff" };
  }
}

// ─── Promotion Card ────────────────────────────────────────────────────────

function PromotionCard({ promo }: { promo: DbPromocion }) {
  const valorLabel =
    promo.tipo === "porcentaje"
      ? `${promo.valor}% OFF`
      : promo.tipo === "monto_fijo"
      ? `-$${promo.valor.toFixed(0)}`
      : TIPO_LABELS[promo.tipo] ?? promo.tipo;

  const badgeColor = getBadgeColor(promo.tipo);

  return (
    <article
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px)";
        el.style.borderColor = "rgba(234,88,12,0.2)";
        el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Image / Header */}
      <div style={{ position: "relative", height: "13rem", overflow: "hidden" }}>
        {promo.imagen_url ? (
          <Image
            src={promo.imagen_url}
            alt={promo.nombre}
            fill
            style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              background: "linear-gradient(135deg, #2a1a0a, #1a1010)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Tag style={{ width: "48px", height: "48px", color: "rgba(234,88,12,0.25)" }} aria-hidden="true" />
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, rgba(26,26,26,0.9), transparent)",
          }}
        />

        {/* Discount badge */}
        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {valorLabel}
          </span>
        </div>

        {/* Type badge */}
        <div style={{ position: "absolute", top: "12px", right: "12px" }}>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "999px",
              background: badgeColor.bg,
              color: badgeColor.text,
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {TIPO_LABELS[promo.tipo] ?? promo.tipo}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "0.5rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {promo.nombre}
        </h3>

        {promo.descripcion && (
          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.45)",
              marginBottom: "1rem",
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {promo.descripcion}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {promo.fecha_fin ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              <Clock style={{ width: "11px", height: "11px", flexShrink: 0 }} aria-hidden="true" />
              <span>Hasta {formatDate(promo.fecha_fin)}</span>
            </div>
          ) : (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "0.68rem",
                color: "#4ade80",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                }}
              />
              Permanente
            </span>
          )}

          <Link
            href="/menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.75rem",
              color: "#f97316",
              fontWeight: 700,
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            aria-label={`Ver menú para la promoción ${promo.nombre}`}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fb923c"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#f97316"; }}
          >
            Ver menú
            <ArrowRight style={{ width: "12px", height: "12px" }} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Fallback Card ────────────────────────────────────────────────────────

function FallbackPromoCard({ index }: { index: number }) {
  const promos = [
    { title: "Combo Familiar",    desc: "40 alitas + 4 bebidas + papas",    badge: "40% OFF", grad: "linear-gradient(135deg, #7c2d12, #431407)" },
    { title: "Happy Hour",        desc: "Lunes a viernes de 3pm a 6pm",     badge: "2×1",     grad: "linear-gradient(135deg, #1e3a5f, #0c1a2e)" },
    { title: "Martes de Promo",   desc: "12 alitas al precio de 8",         badge: "AHORRA",  grad: "linear-gradient(135deg, #3d1a00, #1a0800)" },
    { title: "Cumpleañero",       desc: "15% en tu mes de cumpleaños",      badge: "15% OFF", grad: "linear-gradient(135deg, #1a003d, #0a0018)" },
  ];
  const promo = promos[index % promos.length];
  if (!promo) return null;

  return (
    <article
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-4px)";
        el.style.borderColor = "rgba(234,88,12,0.2)";
        el.style.boxShadow = "0 16px 48px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(255,255,255,0.07)";
        el.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          height: "13rem",
          background: promo.grad,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 800,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {promo.badge}
          </span>
        </div>
        <Tag style={{ width: "44px", height: "44px", color: "rgba(255,255,255,0.15)" }} aria-hidden="true" />
      </div>
      <div style={{ padding: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>{promo.title}</h3>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>{promo.desc}</p>
      </div>
    </article>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function PromotionsSection({ promociones }: PromotionsSectionProps) {
  const hasPromos = promociones.length > 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "1.75rem",
      }}
    >
      {hasPromos
        ? promociones.map((promo) => (
            <PromotionCard key={promo.id} promo={promo} />
          ))
        : Array.from({ length: 4 }).map((_, i) => (
            <FallbackPromoCard key={i} index={i} />
          ))}
    </div>
  );
}

