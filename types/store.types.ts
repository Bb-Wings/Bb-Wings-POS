/**
 * @fileoverview Store Types — BB Wings Management System
 * @description Tipos para los stores de Zustand. Define el estado global
 * de la aplicación de forma tipada y segura.
 * @version 1.0.0
 */

import type { DbProducto, DbCategoria } from "./database.types";

// ─── Auth Store ───────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: "super_admin" | "admin" | "cajero" | "cocinero" | "inventario" | "marketing" | "cliente";
  avatarUrl: string | null;
  clienteId: number | null;
  empleadoId: number | null;
  puntos?: number;
  nivelFidelidad?: "bronce" | "plata" | "oro" | "platino";
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ─── Cart Store ───────────────────────────────────────────────────────────

export interface CartItem {
  id: string;                           // UUID local para el item del carrito
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagenUrl: string | null;
  notas: string | null;
  modificadores: Record<string, unknown>;
  subtotal: number;
}

export interface CartCupon {
  id: number;
  codigo: string;
  descuento: number;
  tipo: "porcentaje" | "monto_fijo";
}

export interface CartState {
  items: CartItem[];
  cupon: CartCupon | null;
  isOpen: boolean;                      // Si el drawer del carrito está abierto
  isProcessing: boolean;
}

export interface CartActions {
  addItem: (producto: DbProducto, cantidad?: number, notas?: string, modificadores?: Record<string, unknown>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  updateNotas: (itemId: string, notas: string) => void;
  clearCart: () => void;
  setCupon: (cupon: CartCupon | null) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setProcessing: (processing: boolean) => void;
}

export interface CartComputedValues {
  totalItems: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
}

export type CartStore = CartState & CartActions & CartComputedValues;

// ─── UI Store ─────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props: Record<string, unknown>;
}

export interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  modals: Modal[];
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;
  searchQuery: string;
  activeCategoryId: number | null;
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (modal: Omit<Modal, "id">) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategoryId: (id: number | null) => void;
}

export type UIStore = UIState & UIActions;

// ─── Menu/Products Store (para el portal público) ─────────────────────────

export interface MenuState {
  categorias: DbCategoria[];
  productos: DbProducto[];
  categoriaActivaId: number | null;
  busqueda: string;
  isLoading: boolean;
  error: string | null;
}

export interface MenuActions {
  setCategorias: (categorias: DbCategoria[]) => void;
  setProductos: (productos: DbProducto[]) => void;
  setCategoriaActiva: (id: number | null) => void;
  setBusqueda: (busqueda: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type MenuStore = MenuState & MenuActions;

// ─── Kitchen Store (pantalla de cocina) ───────────────────────────────────

export interface KitchenOrder {
  id: number;
  numeroPedido: string;
  tipo: string;
  estado: "pendiente" | "preparando" | "listo";
  mesaNumero: string | null;
  detalles: { nombre: string; cantidad: number; notas: string | null }[];
  tiempoInicio: string | null;
  tiempoEstimado: number;
  createdAt: string;
}

export interface KitchenState {
  pedidosPendientes: KitchenOrder[];
  pedidosPreparando: KitchenOrder[];
  pedidosListos: KitchenOrder[];
  isConnected: boolean;
  lastUpdate: string | null;
}

export interface KitchenActions {
  setPedidosPendientes: (pedidos: KitchenOrder[]) => void;
  setPedidosPreparando: (pedidos: KitchenOrder[]) => void;
  setPedidosListos: (pedidos: KitchenOrder[]) => void;
  moverPedido: (id: number, nuevoEstado: "preparando" | "listo" | "entregado") => void;
  agregarPedidoNuevo: (pedido: KitchenOrder) => void;
  setConnected: (connected: boolean) => void;
}

export type KitchenStore = KitchenState & KitchenActions;

// ─── POS Store ────────────────────────────────────────────────────────────

export interface POSState {
  categoriaActivaId: number | null;
  turnoIniciado: boolean;
  turnoId: number | null;
  montoCajaInicial: number;
  totalVentasTurno: number;
  pedidosTurno: number;
}

export interface POSActions {
  iniciarTurno: (montoCajaInicial: number) => void;
  cerrarTurno: () => void;
  setCategoriaActiva: (id: number | null) => void;
  registrarVenta: (monto: number) => void;
}

export type POSStore = POSState & POSActions;
