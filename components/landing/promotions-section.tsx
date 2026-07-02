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
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────

interface PromotionsSectionProps {
  promociones: DbPromocion[];
}

// ─── Promotion Card ────────────────────────────────────────────────────────

function PromotionCard({ promo }: { promo: DbPromocion }) {
  const tipoLabels: Record<string, string> = {
    porcentaje:  "Descuento",
    monto_fijo:  "Ahorra",
    "2x1":       "2×1",
    happy_hour:  "Happy Hour",
    combo:       "Combo",
    evento:      "Evento",
  };

  const valorLabel =
    promo.tipo === "porcentaje"
      ? `${promo.valor}% OFF`
      : promo.tipo === "monto_fijo"
      ? `-$${promo.valor.toFixed(0)}`
      : tipoLabels[promo.tipo] ?? promo.tipo;

  return (
    <article className="group glass-card rounded-2xl overflow-hidden card-lift">
      {/* Image / Header gradient */}
      <div className="relative h-40 overflow-hidden">
        {promo.imagen_url ? (
          <Image
            src={promo.imagen_url}
            alt={promo.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="h-full gradient-primary flex items-center justify-center">
            <Tag className="h-12 w-12 text-white/30" aria-hidden="true" />
          </div>
        )}

        {/* Discount badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-bold font-ui border border-white/10">
            {valorLabel}
          </span>
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" size="sm">
            {tipoLabels[promo.tipo] ?? promo.tipo}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-bold text-white mb-1 line-clamp-1">
          {promo.nombre}
        </h3>
        {promo.descripcion && (
          <p className="text-sm text-gray-muted mb-3 line-clamp-2">
            {promo.descripcion}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between">
          {promo.fecha_fin ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-muted">
              <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
              <span>Hasta {formatDate(promo.fecha_fin)}</span>
            </div>
          ) : (
            <Badge variant="success" size="sm" dot dotColor="success">
              Permanente
            </Badge>
          )}

          <Link
            href="/menu"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary-400 font-semibold transition-colors"
            aria-label={`Ver menú para la promoción ${promo.nombre}`}
          >
            Ver menú
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Fallback Card ────────────────────────────────────────────────────────

function FallbackPromoCard({ index }: { index: number }) {
  const promos = [
    { title: "Combo Familiar", desc: "40 alitas + 4 bebidas + papas", badge: "40% OFF", color: "from-primary to-primary-700" },
    { title: "Happy Hour", desc: "Lunes a viernes de 3pm a 6pm", badge: "2×1", color: "from-secondary to-secondary-700" },
    { title: "Martes de Promo", desc: "12 alitas al precio de 8", badge: "AHORRA", color: "from-primary-800 to-dark" },
    { title: "Cumpleañero", desc: "15% en tu mes de cumpleaños", badge: "15% OFF", color: "from-secondary-800 to-dark" },
  ];
  const promo = promos[index % promos.length];
  if (!promo) return null;

  return (
    <article className="glass-card rounded-2xl overflow-hidden card-lift">
      <div className={`h-40 bg-gradient-to-br ${promo.color} flex items-center justify-center relative`}>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-sm font-bold font-ui">
            {promo.badge}
          </span>
        </div>
        <Tag className="h-12 w-12 text-white/20" aria-hidden="true" />
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-bold text-white mb-1">{promo.title}</h3>
        <p className="text-sm text-gray-muted">{promo.desc}</p>
      </div>
    </article>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function PromotionsSection({ promociones }: PromotionsSectionProps) {
  const hasPromos = promociones.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
