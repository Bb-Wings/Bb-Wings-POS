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
import { Plus, Flame, Star, Clock } from "lucide-react";
import type { DbProducto } from "@/types/database.types";
import { useCartStore } from "@/lib/store/cart.store";
import { useToast } from "@/lib/store/ui.store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";

// ─── Product Card ──────────────────────────────────────────────────────────

function ProductCard({ producto, index }: { producto: DbProducto; index: number }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const toast = useToast();

  const handleAddToCart = () => {
    addItem(producto, 1);
    toast.success(
      "¡Agregado al carrito!",
      `${producto.nombre} × 1`
    );
    openCart();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#161616]">
        {producto.imagen_principal ? (
          <Image
            src={producto.imagen_principal}
            alt={producto.nombre}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Flame
              className="h-16 w-16 text-primary/30"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {producto.es_nuevo && (
            <Badge variant="primary" size="sm">Nuevo</Badge>
          )}
          {producto.es_popular && (
            <Badge variant="secondary" size="sm">Popular</Badge>
          )}
        </div>

        {/* Spice level */}
        {producto.es_picante && producto.nivel_picante && (
          <div className="absolute top-2.5 right-2.5 flex">
            {Array.from({ length: producto.nivel_picante }).map((_, i) => (
              <Flame
                key={i}
                className="h-3.5 w-3.5 text-warning"
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Not available overlay */}
        {!producto.disponible && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-bold font-ui px-3 py-1.5 rounded-full bg-black/70 border border-white/20">
              No Disponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-base font-bold text-white mb-1 line-clamp-1">
          {producto.nombre}
        </h3>

        {producto.descripcion && (
          <p className="text-xs text-gray-muted mb-3 line-clamp-2 leading-relaxed">
            {producto.descripcion}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-muted">
          {producto.calorias && (
            <span>{producto.calorias} cal</span>
          )}
          {producto.tiempo_preparacion && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {producto.tiempo_preparacion}min
            </span>
          )}
          {producto.es_vegetariano && (
            <span className="text-success">🌿 Veg</span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-white font-ui">
            {formatCurrency(producto.precio)}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={!producto.disponible}
            aria-label={`Agregar ${producto.nombre} al carrito`}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary text-white hover:bg-primary-600 hover:shadow-glow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
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
    { id: 1, categoria_id: 1, nombre: "Alitas BBQ Clásicas", descripcion: "Las más vendidas con salsa BBQ dulce y ahumada", precio: 159, precio_costo: null, slug: "alitas-bbq", sku: null, codigo_barras: null, imagen_principal: null, calorias: 380, es_nuevo: false, es_popular: true, es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 20, disponible: true, estado: "activo", orden: 1, created_at: "", updated_at: "" },
    { id: 2, categoria_id: 1, nombre: "Alitas Buffalo Picantes", descripcion: "Para los valientes. Salsa buffalo original", precio: 169, precio_costo: null, slug: "alitas-buffalo", sku: null, codigo_barras: null, imagen_principal: null, calorias: 350, es_nuevo: false, es_popular: true, es_vegetariano: false, es_picante: true, nivel_picante: 3, tiempo_preparacion: 20, disponible: true, estado: "activo", orden: 2, created_at: "", updated_at: "" },
    { id: 3, categoria_id: 1, nombre: "Alitas Mango Habanero", descripcion: "El equilibrio perfecto entre dulce y picante", precio: 179, precio_costo: null, slug: "alitas-mango-habanero", sku: null, codigo_barras: null, imagen_principal: null, calorias: 360, es_nuevo: true, es_popular: false, es_vegetariano: false, es_picante: true, nivel_picante: 4, tiempo_preparacion: 20, disponible: true, estado: "activo", orden: 3, created_at: "", updated_at: "" },
    { id: 4, categoria_id: 1, nombre: "Alitas Teriyaki", descripcion: "Sabor asiático con glaseado teriyaki irresistible", precio: 174, precio_costo: null, slug: "alitas-teriyaki", sku: null, codigo_barras: null, imagen_principal: null, calorias: 395, es_nuevo: false, es_popular: false, es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 25, disponible: true, estado: "activo", orden: 4, created_at: "", updated_at: "" },
    { id: 5, categoria_id: 2, nombre: "Combo Familiar 40pz", descripcion: "40 alitas a tu elección + papas + 4 bebidas", precio: 599, precio_costo: null, slug: "combo-familiar", sku: null, codigo_barras: null, imagen_principal: null, calorias: null, es_nuevo: false, es_popular: true, es_vegetariano: false, es_picante: false, nivel_picante: null, tiempo_preparacion: 30, disponible: true, estado: "activo", orden: 5, created_at: "", updated_at: "" },
    { id: 6, categoria_id: 3, nombre: "Papas con Queso", descripcion: "Papas a la francesa bañadas en queso cheddar", precio: 79, precio_costo: null, slug: "papas-queso", sku: null, codigo_barras: null, imagen_principal: null, calorias: 420, es_nuevo: false, es_popular: false, es_vegetariano: true, es_picante: false, nivel_picante: null, tiempo_preparacion: 10, disponible: true, estado: "activo", orden: 6, created_at: "", updated_at: "" },
    { id: 7, categoria_id: 4, nombre: "Nachos Supremos", descripcion: "Nachos con frijoles, jalapeños, crema y guacamole", precio: 109, precio_costo: null, slug: "nachos-supremos", sku: null, codigo_barras: null, imagen_principal: null, calorias: 580, es_nuevo: true, es_popular: false, es_vegetariano: true, es_picante: true, nivel_picante: 2, tiempo_preparacion: 12, disponible: true, estado: "activo", orden: 7, created_at: "", updated_at: "" },
    { id: 8, categoria_id: 5, nombre: "Malteada Oreo", descripcion: "Espesa, cremosa y cargada de Oreos", precio: 89, precio_costo: null, slug: "malteada-oreo", sku: null, codigo_barras: null, imagen_principal: null, calorias: 520, es_nuevo: false, es_popular: false, es_vegetariano: true, es_picante: false, nivel_picante: null, tiempo_preparacion: 5, disponible: true, estado: "activo", orden: 8, created_at: "", updated_at: "" },
  ];

  const displayProducts = productos.length > 0 ? productos : demoProducts;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((producto, index) => (
          <ProductCard key={producto.id} producto={producto} index={index} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 font-semibold font-ui transition-all duration-200 hover:border-primary/60"
        >
          Ver menú completo
          <Star className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}
