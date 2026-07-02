'use client'
/**
 * @fileoverview Menu Preview — BB Wings Management System
 * @description Grid de productos populares con animaciones de entrada,
 * botón de agregar al carrito y filtro de categorías.
 * @version 1.0.0
 */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Flame, Clock, Star } from "lucide-react";
import type { DbProducto } from "@/types/database.types";
import { useCartStore } from "@/lib/store/cart.store";
import { useToast } from "@/lib/store/ui.store";
import { formatCurrency } from "@/lib/utils/formatters";

// ─── Product Card ──────────────────────────────────────────────────────────

function ProductCard({ producto, index }: { producto: DbProducto; index: number }) {
  const addItem  = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toast    = useToast();

  const handleAddToCart = () => {
    addItem(producto, 1);
    toast.success("¡Agregado al carrito!", `${producto.nombre} × 1`);
    openCart();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      style={{
        background: "#1a1a1a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1.25rem",
        overflow: "hidden",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        cursor: "default",
      }}
      whileHover={{
        y: -4,
        borderColor: "rgba(234,88,12,0.25)",
        boxShadow: "0 12px 40px rgba(234,88,12,0.08)",
        transition: { duration: 0.25 },
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          height: "15rem",
          overflow: "hidden",
          background: "#111",
        }}
      >
        {producto.imagen_principal ? (
          <Image
            src={producto.imagen_principal}
            alt={producto.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #1f1f1f, #151515)",
            }}
          >
            <Flame
              style={{ width: "56px", height: "56px", color: "rgba(234,88,12,0.25)" }}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Badges top-left */}
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
          {producto.es_nuevo && (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(234,88,12,0.9)",
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                backdropFilter: "blur(8px)",
              }}
            >
              Nuevo
            </span>
          )}
          {producto.es_popular && (
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(250,204,21,0.9)",
                color: "#000",
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                backdropFilter: "blur(8px)",
              }}
            >
              Popular
            </span>
          )}
        </div>

        {/* Spice level top-right */}
        {producto.es_picante && producto.nivel_picante && (
          <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex" }}>
            {Array.from({ length: producto.nivel_picante }).map((_, i) => (
              <Flame
                key={i}
                style={{ width: "14px", height: "14px", color: "#f97316" }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Not available overlay */}
        {!producto.disponible && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              No Disponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem" }}>
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "0.4rem",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "0.875rem",
              lineHeight: 1.6,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {producto.descripcion}
          </p>
        )}

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.875rem",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          {producto.calorias && <span>{producto.calorias} cal</span>}
          {producto.tiempo_preparacion && (
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Clock style={{ width: "11px", height: "11px" }} aria-hidden="true" />
              {producto.tiempo_preparacion}min
            </span>
          )}
          {producto.es_vegetariano && (
            <span style={{ color: "#4ade80" }}>🌿 Veg</span>
          )}
        </div>

        {/* Price & CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {formatCurrency(producto.precio)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!producto.disponible}
            aria-label={`Agregar ${producto.nombre} al carrito`}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "0.75rem",
              background: "linear-gradient(135deg, #ea580c, #f97316)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: producto.disponible ? "pointer" : "not-allowed",
              opacity: producto.disponible ? 1 : 0.4,
              transition: "box-shadow 0.2s ease, transform 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!producto.disponible) return;
              const el = e.currentTarget;
              el.style.boxShadow = "0 0 20px rgba(234,88,12,0.5)";
              el.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.boxShadow = "none";
              el.style.transform = "scale(1)";
            }}
          >
            <Plus style={{ width: "16px", height: "16px" }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface MenuPreviewProps {
  productos: DbProducto[];
}

export function MenuPreview({ productos }: MenuPreviewProps) {
  const demoProducts: DbProducto[] = [
    { id: 1, categoria_id: 1, nombre: "Alitas BBQ Clásicas",    descripcion: "Las más vendidas con salsa BBQ dulce y ahumada",       precio: 159, precio_costo: null, slug: "alitas-bbq",       sku: null, codigo_barras: null, imagen_principal: null, calorias: 380, es_nuevo: false, es_popular: true,  es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 20, disponible: true,  estado: "activo", orden: 1, created_at: "", updated_at: "" },
    { id: 2, categoria_id: 1, nombre: "Alitas Buffalo Picantes", descripcion: "Para los valientes. Salsa buffalo original",            precio: 169, precio_costo: null, slug: "alitas-buffalo",   sku: null, codigo_barras: null, imagen_principal: null, calorias: 350, es_nuevo: false, es_popular: true,  es_vegetariano: false, es_picante: true,  nivel_picante: 3,    tiempo_preparacion: 20, disponible: true,  estado: "activo", orden: 2, created_at: "", updated_at: "" },
    { id: 3, categoria_id: 1, nombre: "Alitas Mango Habanero",   descripcion: "El equilibrio perfecto entre dulce y picante",         precio: 179, precio_costo: null, slug: "alitas-mango-habanero", sku: null, codigo_barras: null, imagen_principal: null, calorias: 360, es_nuevo: true,  es_popular: false, es_vegetariano: false, es_picante: true,  nivel_picante: 4,    tiempo_preparacion: 20, disponible: true,  estado: "activo", orden: 3, created_at: "", updated_at: "" },
    { id: 4, categoria_id: 1, nombre: "Alitas Teriyaki",         descripcion: "Sabor asiático con glaseado teriyaki irresistible",    precio: 174, precio_costo: null, slug: "alitas-teriyaki",   sku: null, codigo_barras: null, imagen_principal: null, calorias: 395, es_nuevo: false, es_popular: false, es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 25, disponible: true,  estado: "activo", orden: 4, created_at: "", updated_at: "" },
    { id: 5, categoria_id: 2, nombre: "Combo Familiar 40pz",     descripcion: "40 alitas a tu elección + papas + 4 bebidas",         precio: 599, precio_costo: null, slug: "combo-familiar",    sku: null, codigo_barras: null, imagen_principal: null, calorias: null, es_nuevo: false, es_popular: true,  es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 30, disponible: true,  estado: "activo", orden: 5, created_at: "", updated_at: "" },
    { id: 6, categoria_id: 3, nombre: "Papas con Queso",         descripcion: "Papas a la francesa bañadas en queso cheddar",        precio: 79,  precio_costo: null, slug: "papas-queso",       sku: null, codigo_barras: null, imagen_principal: null, calorias: 420, es_nuevo: false, es_popular: false, es_vegetariano: true,  es_picante: false, nivel_picante: null, tiempo_preparacion: 10, disponible: true,  estado: "activo", orden: 6, created_at: "", updated_at: "" },
    { id: 7, categoria_id: 4, nombre: "Nachos Supremos",         descripcion: "Nachos con frijoles, jalapeños, crema y guacamole",   precio: 109, precio_costo: null, slug: "nachos-supremos",   sku: null, codigo_barras: null, imagen_principal: null, calorias: 580, es_nuevo: true,  es_popular: false, es_vegetariano: true,  es_picante: true,  nivel_picante: 2,    tiempo_preparacion: 12, disponible: true,  estado: "activo", orden: 7, created_at: "", updated_at: "" },
    { id: 8, categoria_id: 5, nombre: "Malteada Oreo",           descripcion: "Espesa, cremosa y cargada de Oreos",                  precio: 89,  precio_costo: null, slug: "malteada-oreo",     sku: null, codigo_barras: null, imagen_principal: null, calorias: 520, es_nuevo: false, es_popular: false, es_vegetariano: true,  es_picante: false, nivel_picante: null, tiempo_preparacion: 5,  disponible: true,  estado: "activo", orden: 8, created_at: "", updated_at: "" },
  ];

  const displayProducts = productos.length > 0 ? productos : demoProducts;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.75rem",
        }}
      >
        {displayProducts.map((producto, index) => (
          <ProductCard key={producto.id} producto={producto} index={index} />
        ))}
      </div>

      <div style={{ marginTop: "3.5rem", textAlign: "center" }}>
        <Link
          href="/menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.875rem 2rem",
            borderRadius: "0.875rem",
            border: "1px solid rgba(234,88,12,0.3)",
            color: "#f97316",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(234,88,12,0.1)";
            el.style.borderColor = "rgba(234,88,12,0.6)";
            el.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.borderColor = "rgba(234,88,12,0.3)";
            el.style.transform = "translateY(0)";
          }}
        >
          Ver menú completo
          <Star style={{ width: "15px", height: "15px" }} aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
