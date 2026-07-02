/**
 * @fileoverview Cart Store — BB Wings Management System
 * @description Store de Zustand para el carrito de compras. Implementa lógica
 * de negocio para cálculo de totales, descuentos y cupones.
 * Persiste el carrito en localStorage entre sesiones.
 * @version 1.0.0
 */

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { CartStore, CartItem, CartCupon } from "@/types/store.types";
import type { DbProducto } from "@/types/database.types";

// ─── Constants ────────────────────────────────────────────────────────────

/** IVA del 16% */
const TAX_RATE = 0.16;

// ─── Store ────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ─── State ────────────────────────────────────────────────────
        items: [],
        cupon: null,
        isOpen: false,
        isProcessing: false,

        // ─── Computed Values (getters) ─────────────────────────────────

        get totalItems() {
          return get().items.reduce((acc, item) => acc + item.cantidad, 0);
        },

        get subtotal() {
          return get().items.reduce((acc, item) => acc + item.subtotal, 0);
        },

        get descuento() {
          const cupon = get().cupon;
          if (cupon === null) return 0;
          const sub = get().items.reduce((acc, item) => acc + item.subtotal, 0);

          if (cupon.tipo === "porcentaje") {
            return Math.round(sub * (cupon.descuento / 100) * 100) / 100;
          }
          return Math.min(cupon.descuento, sub);
        },

        get impuesto() {
          const sub = get().items.reduce((acc, item) => acc + item.subtotal, 0);
          const desc = (() => {
            const cupon = get().cupon;
            if (cupon === null) return 0;
            if (cupon.tipo === "porcentaje") {
              return Math.round(sub * (cupon.descuento / 100) * 100) / 100;
            }
            return Math.min(cupon.descuento, sub);
          })();
          return Math.round((sub - desc) * TAX_RATE * 100) / 100;
        },

        get total() {
          const sub = get().items.reduce((acc, item) => acc + item.subtotal, 0);
          const cupon = get().cupon;
          const desc = cupon === null
            ? 0
            : cupon.tipo === "porcentaje"
              ? Math.round(sub * (cupon.descuento / 100) * 100) / 100
              : Math.min(cupon.descuento, sub);
          const tax = Math.round((sub - desc) * TAX_RATE * 100) / 100;
          return Math.round((sub - desc + tax) * 100) / 100;
        },

        // ─── Actions ──────────────────────────────────────────────────

        addItem: (
          producto: DbProducto,
          cantidad: number = 1,
          notas: string = "",
          modificadores: Record<string, unknown> = {}
        ) => {
          set((state) => {
            // Buscar si el producto ya existe con los mismos modificadores
            const existingIndex = state.items.findIndex(
              (item) =>
                item.productoId === producto.id &&
                JSON.stringify(item.modificadores) ===
                  JSON.stringify(modificadores)
            );

            if (existingIndex !== -1) {
              // Actualizar cantidad del item existente
              const updatedItems = [...state.items];
              const existing = updatedItems[existingIndex];
              if (existing !== undefined) {
                const newCantidad = existing.cantidad + cantidad;
                updatedItems[existingIndex] = {
                  ...existing,
                  cantidad: newCantidad,
                  subtotal: Math.round(newCantidad * existing.precio * 100) / 100,
                };
              }
              return { items: updatedItems };
            }

            // Agregar nuevo item
            const newItem: CartItem = {
              id: uuidv4(),
              productoId: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              cantidad,
              imagenUrl: producto.imagen_principal,
              notas: notas.trim() || null,
              modificadores,
              subtotal: Math.round(cantidad * producto.precio * 100) / 100,
            };

            return { items: [...state.items, newItem] };
          }, false, "cart/addItem");
        },

        removeItem: (itemId: string) => {
          set(
            (state) => ({
              items: state.items.filter((item) => item.id !== itemId),
            }),
            false,
            "cart/removeItem"
          );
        },

        updateQuantity: (itemId: string, cantidad: number) => {
          if (cantidad <= 0) {
            get().removeItem(itemId);
            return;
          }

          set(
            (state) => ({
              items: state.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      cantidad,
                      subtotal: Math.round(cantidad * item.precio * 100) / 100,
                    }
                  : item
              ),
            }),
            false,
            "cart/updateQuantity"
          );
        },

        updateNotas: (itemId: string, notas: string) => {
          set(
            (state) => ({
              items: state.items.map((item) =>
                item.id === itemId
                  ? { ...item, notas: notas.trim() || null }
                  : item
              ),
            }),
            false,
            "cart/updateNotas"
          );
        },

        clearCart: () => {
          set(
            { items: [], cupon: null },
            false,
            "cart/clear"
          );
        },

        setCupon: (cupon: CartCupon | null) => {
          set({ cupon }, false, "cart/setCupon");
        },

        toggleCart: () => {
          set(
            (state) => ({ isOpen: !state.isOpen }),
            false,
            "cart/toggle"
          );
        },

        openCart: () => {
          set({ isOpen: true }, false, "cart/open");
        },

        closeCart: () => {
          set({ isOpen: false }, false, "cart/close");
        },

        setProcessing: (isProcessing: boolean) => {
          set({ isProcessing }, false, "cart/setProcessing");
        },
      }),
      {
        name: "bb-wings-cart",
        // Solo persistir items y cupón, no el estado de UI
        partialize: (state) => ({
          items: state.items,
          cupon: state.cupon,
        }),
      }
    ),
    { name: "CartStore" }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsOpen = () => useCartStore((state) => state.isOpen);
export const useCartIsProcessing = () =>
  useCartStore((state) => state.isProcessing);
export const useCartCupon = () => useCartStore((state) => state.cupon);

/** Número total de items en el carrito (suma de cantidades) */
export const useCartTotalItems = () =>
  useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.cantidad, 0)
  );

/** Subtotal antes de descuento e impuesto */
export const useCartSubtotal = () =>
  useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.subtotal, 0)
  );
