/**
 * @fileoverview API Types — BB Wings Management System
 * @description Tipos para las respuestas y solicitudes de la API REST del
 * backend C++ (Drogon). Incluye wrappers de respuesta, paginación y errores.
 * @version 1.0.0
 */

// ─── Generic API Response Wrapper ─────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message: string | null;
  timestamp: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── Auth API ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    avatar_url: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── Products API ──────────────────────────────────────────────────────────

export interface ProductFilters extends PaginationParams {
  categoriaId?: number;
  busqueda?: string;
  disponible?: boolean;
  estado?: string;
  esNuevo?: boolean;
  esPopular?: boolean;
  precioMin?: number;
  precioMax?: number;
}

export interface CreateProductoRequest {
  categoriaId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioCosto?: number;
  sku?: string;
  codigoBarras?: string;
  calorias?: number;
  esNuevo?: boolean;
  esPopular?: boolean;
  esVegetariano?: boolean;
  esPicante?: boolean;
  nivelPicante?: number;
  tiempoPreparacion?: number;
  orden?: number;
}

export interface UpdateProductoRequest extends Partial<CreateProductoRequest> {
  disponible?: boolean;
  estado?: "activo" | "inactivo" | "agotado";
}

// ─── Orders API ───────────────────────────────────────────────────────────

export interface CreateDetallePedidoRequest {
  productoId: number;
  cantidad: number;
  notas?: string;
  modificadores?: Record<string, unknown>;
}

export interface CreatePedidoRequest {
  tipo: "local" | "para_llevar" | "delivery" | "drive_thru";
  detalles: CreateDetallePedidoRequest[];
  cuponCodigo?: string;
  notas?: string;
  direccionEntrega?: string;
  mesaNumero?: string;
  personas?: number;
}

export interface UpdatePedidoEstadoRequest {
  estado: "confirmado" | "preparando" | "listo" | "entregado" | "cancelado";
  notas?: string;
}

export interface OrderFilters extends PaginationParams {
  estado?: string;
  tipo?: string;
  clienteId?: number;
  fechaInicio?: string;
  fechaFin?: string;
  busqueda?: string;
}

// ─── Payments API ─────────────────────────────────────────────────────────

export interface CreatePagoRequest {
  pedidoId: number;
  metodo: "efectivo" | "tarjeta_credito" | "tarjeta_debito" | "transferencia" | "qr" | "puntos";
  monto: number;
  montoRecibido?: number;
  referenciaExterna?: string;
  ultimos4?: string;
}

// ─── Inventory API ────────────────────────────────────────────────────────

export interface CreateMovimientoRequest {
  inventarioId: number;
  tipo: "entrada" | "salida" | "ajuste" | "merma";
  cantidad: number;
  motivo?: string;
  costoUnitario?: number;
}

export interface InventoryFilters extends PaginationParams {
  productoId?: number;
  alertaActiva?: boolean;
  bajoMinimo?: boolean;
  busqueda?: string;
}

// ─── Reservations API ────────────────────────────────────────────────────

export interface CreateReservaRequest {
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto?: string;
  fecha: string;
  hora: string;
  personas: number;
  notas?: string;
}

// ─── Reports API ─────────────────────────────────────────────────────────

export interface ReporteFiltros {
  fechaInicio: string;
  fechaFin: string;
  granularidad?: "dia" | "semana" | "mes";
}

export interface ResumenVentas {
  totalVentas: number;
  totalPedidos: number;
  ticketPromedio: number;
  crecimientoVentas: number;    // % vs periodo anterior
  crecimientoPedidos: number;   // % vs periodo anterior
  ventasPorDia: { fecha: string; ventas: number; pedidos: number }[];
  ventasPorCategoria: { categoria: string; ventas: number; porcentaje: number }[];
  topProductos: { nombre: string; cantidad: number; ventas: number }[];
  ventasPorMetodoPago: { metodo: string; monto: number; porcentaje: number }[];
}

export interface ResumenInventario {
  totalProductos: number;
  productosAgotados: number;
  productosBajoMinimo: number;
  valorTotal: number;
  alertasCriticas: number;
}

// ─── WebSocket Messages ───────────────────────────────────────────────────

export type WsMessageType =
  | "pedido_nuevo"
  | "pedido_actualizado"
  | "pedido_cancelado"
  | "stock_bajo"
  | "stock_agotado"
  | "notificacion"
  | "heartbeat"
  | "ping"
  | "pong";

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  payload: T;
  timestamp: string;
  id: string;
}

export interface WsPedidoNuevo {
  pedidoId: number;
  numeroPedido: string;
  tipo: string;
  detalles: { producto: string; cantidad: number }[];
  mesaNumero: string | null;
  notas: string | null;
  tiempoEstimado: number;
}

export interface WsStockAlerta {
  productoId: number;
  productoNombre: string;
  cantidadActual: number;
  cantidadMinima: number;
  nivelAlerta: "bajo" | "critico" | "agotado";
}

// ─── Upload API ───────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

// ─── Coupons API ─────────────────────────────────────────────────────────

export interface ValidarCuponRequest {
  codigo: string;
  monto: number;
}

export interface ValidarCuponResponse {
  valido: boolean;
  descuento: number;
  tipo: "porcentaje" | "monto_fijo";
  mensaje: string;
  cuponId?: number;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

export interface DashboardStats {
  ventasHoy: number;
  ventasAyer: number;
  pedidosHoy: number;
  pedidosPendientes: number;
  clientesNuevos: number;
  productosAgotados: number;
  reservasHoy: number;
  ticketPromedio: number;
  tendenciaVentas: "subida" | "bajada" | "igual";
}
