/**
 * @fileoverview Database Types — BB Wings Management System
 * @description Tipos TypeScript que reflejan el esquema de la base de datos
 * en Supabase/PostgreSQL. Se actualizan con: npx supabase gen types typescript
 * @version 1.0.0
 */

// ─── Enums de Base de Datos ────────────────────────────────────────────────

export type RolNombre =
  | "super_admin"
  | "admin"
  | "cajero"
  | "cocinero"
  | "inventario"
  | "marketing"
  | "cliente";

export type EstadoPedido =
  | "pendiente"
  | "confirmado"
  | "preparando"
  | "listo"
  | "entregado"
  | "cancelado";

export type TipoPedido = "local" | "para_llevar" | "delivery" | "drive_thru";

export type EstadoPago = "pendiente" | "completado" | "fallido" | "reembolsado";

export type MetodoPago =
  | "efectivo"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia"
  | "qr"
  | "puntos";

export type EstadoReserva =
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "completada"
  | "no_show";

export type TipoMovimiento = "entrada" | "salida" | "ajuste" | "merma";

export type EstadoProducto = "activo" | "inactivo" | "agotado";

export type TipoPromocion =
  | "porcentaje"
  | "monto_fijo"
  | "2x1"
  | "happy_hour"
  | "combo"
  | "evento";

export type EstadoEmpleado = "activo" | "inactivo" | "vacaciones" | "baja";

// ─── Tablas de Base de Datos ───────────────────────────────────────────────

export interface DbRol {
  id: number;
  nombre: RolNombre;
  descripcion: string | null;
  permisos: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface DbUsuario {
  id: string; // UUID de Supabase Auth
  rol_id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  avatar_url: string | null;
  activo: boolean;
  ultimo_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCliente {
  id: number;
  usuario_id: string;
  fecha_nacimiento: string | null;
  direccion: string | null;
  ciudad: string | null;
  colonia: string | null;
  cp: string | null;
  puntos_acumulados: number;
  puntos_canjeados: number;
  nivel_fidelidad: "bronce" | "plata" | "oro" | "platino";
  qr_code: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEmpleado {
  id: number;
  usuario_id: string;
  rol_id: number;
  numero_empleado: string;
  departamento: string | null;
  puesto: string | null;
  salario: number | null;
  fecha_ingreso: string;
  estado: EstadoEmpleado;
  created_at: string;
  updated_at: string;
}

export interface DbCategoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  slug: string;
  orden: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProducto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_costo: number | null;
  slug: string;
  sku: string | null;
  codigo_barras: string | null;
  imagen_principal: string | null;
  calorias: number | null;
  es_nuevo: boolean;
  es_popular: boolean;
  es_vegetariano: boolean;
  es_picante: boolean;
  nivel_picante: number | null; // 1-5
  tiempo_preparacion: number | null; // minutos
  disponible: boolean;
  estado: EstadoProducto;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface DbImagen {
  id: number;
  producto_id: number;
  url: string;
  alt_text: string | null;
  es_principal: boolean;
  orden: number;
  created_at: string;
}

export interface DbProveedor {
  id: number;
  nombre: string;
  rfc: string | null;
  contacto: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  ciudad: string | null;
  activo: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInventario {
  id: number;
  producto_id: number;
  proveedor_id: number | null;
  cantidad_actual: number;
  cantidad_minima: number;
  cantidad_maxima: number | null;
  unidad: string;
  ubicacion: string | null;
  lote: string | null;
  fecha_vencimiento: string | null;
  costo_unitario: number | null;
  alerta_activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMovimiento {
  id: number;
  inventario_id: number;
  usuario_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  cantidad_anterior: number;
  cantidad_posterior: number;
  motivo: string | null;
  referencia_id: number | null; // ID de pedido o compra
  costo_unitario: number | null;
  created_at: string;
}

export interface DbPromocion {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: TipoPromocion;
  valor: number; // Porcentaje o monto
  imagen_url: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  hora_inicio: string | null; // Para happy hour
  hora_fin: string | null;
  dias_semana: number[] | null; // 0=Dom, 1=Lun, ..., 6=Sab
  activa: boolean;
  limite_uso: number | null;
  usos_actuales: number;
  minimo_compra: number | null;
  productos_ids: number[] | null;
  categorias_ids: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbCupon {
  id: number;
  promocion_id: number | null;
  codigo: string;
  descripcion: string | null;
  descuento_tipo: "porcentaje" | "monto_fijo";
  descuento_valor: number;
  minimo_compra: number | null;
  uso_maximo: number | null;
  usos_actuales: number;
  uso_por_cliente: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
  cliente_id: number | null; // Si es exclusivo para un cliente
  created_at: string;
  updated_at: string;
}

export interface DbPedido {
  id: number;
  cliente_id: number | null;
  empleado_id: number | null; // Cajero que tomó el pedido
  numero_pedido: string;
  tipo: TipoPedido;
  estado: EstadoPedido;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  cupon_id: number | null;
  notas: string | null;
  direccion_entrega: string | null;
  tiempo_estimado: number | null; // minutos
  tiempo_real: number | null;
  mesa_numero: string | null;
  personas: number | null;
  token_seguimiento: string; // Para rastreo público
  created_at: string;
  updated_at: string;
}

export interface DbDetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  notas: string | null;
  modificadores: Record<string, unknown> | null; // Extras, salsas, etc.
  estado: "pendiente" | "preparando" | "listo" | "cancelado";
  created_at: string;
  updated_at: string;
}

export interface DbReserva {
  id: number;
  cliente_id: number | null;
  empleado_id: number | null;
  nombre_contacto: string;
  telefono_contacto: string;
  email_contacto: string | null;
  fecha: string;
  hora: string;
  personas: number;
  mesa_asignada: string | null;
  estado: EstadoReserva;
  notas: string | null;
  confirmacion_token: string;
  recordatorio_enviado: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbPago {
  id: number;
  pedido_id: number;
  metodo: MetodoPago;
  estado: EstadoPago;
  monto: number;
  monto_recibido: number | null;
  cambio: number | null;
  referencia_externa: string | null; // ID de transacción del procesador
  ultimos_4: string | null; // Últimos 4 dígitos de tarjeta
  procesado_por: string | null; // Usuario ID del cajero
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbFactura {
  id: number;
  pedido_id: number;
  pago_id: number;
  numero_factura: string;
  rfc_cliente: string | null;
  razon_social: string | null;
  cfdi_uso: string | null;
  subtotal: number;
  iva: number;
  total: number;
  pdf_url: string | null;
  xml_url: string | null;
  timbrada: boolean;
  folio_fiscal: string | null;
  created_at: string;
}

export interface DbComentario {
  id: number;
  cliente_id: number;
  producto_id: number;
  pedido_id: number | null;
  texto: string;
  moderado: boolean;
  visible: boolean;
  respuesta_admin: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCalificacion {
  id: number;
  cliente_id: number;
  producto_id: number | null;
  pedido_id: number | null;
  calificacion: number; // 1-5
  categoria: "sabor" | "servicio" | "tiempo" | "limpieza" | "general";
  created_at: string;
}

export interface DbNotificacion {
  id: number;
  usuario_id: string;
  tipo: "pedido" | "promocion" | "reserva" | "sistema" | "puntos" | "stock";
  titulo: string;
  mensaje: string;
  datos: Record<string, unknown> | null;
  leida: boolean;
  created_at: string;
}

export interface DbLog {
  id: number;
  usuario_id: string | null;
  nivel: "debug" | "info" | "warn" | "error" | "critical";
  modulo: string;
  accion: string;
  mensaje: string;
  datos: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface DbAuditoria {
  id: number;
  usuario_id: string | null;
  tabla: string;
  registro_id: string;
  accion: "INSERT" | "UPDATE" | "DELETE";
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

// ─── Tipos con Relaciones (Joined) ────────────────────────────────────────

export interface ProductoConCategoria extends DbProducto {
  categoria: DbCategoria;
  imagenes: DbImagen[];
}

export interface PedidoCompleto extends DbPedido {
  cliente: DbCliente & { usuario: DbUsuario };
  empleado: (DbEmpleado & { usuario: DbUsuario }) | null;
  detalles: (DbDetallePedido & { producto: DbProducto })[];
  pagos: DbPago[];
  cupon: DbCupon | null;
}

export interface ClienteCompleto extends DbCliente {
  usuario: DbUsuario;
  pedidos_count: number;
  total_gastado: number;
}

// ─── Tipo de Base de Datos Supabase ───────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      roles:           { Row: DbRol;           Insert: Omit<DbRol, "id" | "created_at" | "updated_at">;           Update: Partial<Omit<DbRol, "id" | "created_at">> };
      usuarios:        { Row: DbUsuario;        Insert: Omit<DbUsuario, "created_at" | "updated_at">;               Update: Partial<Omit<DbUsuario, "id" | "created_at">> };
      clientes:        { Row: DbCliente;        Insert: Omit<DbCliente, "id" | "created_at" | "updated_at">;        Update: Partial<Omit<DbCliente, "id" | "created_at">> };
      empleados:       { Row: DbEmpleado;       Insert: Omit<DbEmpleado, "id" | "created_at" | "updated_at">;       Update: Partial<Omit<DbEmpleado, "id" | "created_at">> };
      categorias:      { Row: DbCategoria;      Insert: Omit<DbCategoria, "id" | "created_at" | "updated_at">;      Update: Partial<Omit<DbCategoria, "id" | "created_at">> };
      productos:       { Row: DbProducto;       Insert: Omit<DbProducto, "id" | "created_at" | "updated_at">;       Update: Partial<Omit<DbProducto, "id" | "created_at">> };
      imagenes:        { Row: DbImagen;         Insert: Omit<DbImagen, "id" | "created_at">;                        Update: Partial<Omit<DbImagen, "id" | "created_at">> };
      proveedores:     { Row: DbProveedor;      Insert: Omit<DbProveedor, "id" | "created_at" | "updated_at">;      Update: Partial<Omit<DbProveedor, "id" | "created_at">> };
      inventario:      { Row: DbInventario;     Insert: Omit<DbInventario, "id" | "created_at" | "updated_at">;     Update: Partial<Omit<DbInventario, "id" | "created_at">> };
      movimientos:     { Row: DbMovimiento;     Insert: Omit<DbMovimiento, "id" | "created_at">;                    Update: never };
      promociones:     { Row: DbPromocion;      Insert: Omit<DbPromocion, "id" | "created_at" | "updated_at">;      Update: Partial<Omit<DbPromocion, "id" | "created_at">> };
      cupones:         { Row: DbCupon;          Insert: Omit<DbCupon, "id" | "created_at" | "updated_at">;          Update: Partial<Omit<DbCupon, "id" | "created_at">> };
      pedidos:         { Row: DbPedido;         Insert: Omit<DbPedido, "id" | "created_at" | "updated_at">;         Update: Partial<Omit<DbPedido, "id" | "created_at">> };
      detalle_pedido:  { Row: DbDetallePedido;  Insert: Omit<DbDetallePedido, "id" | "created_at" | "updated_at">; Update: Partial<Omit<DbDetallePedido, "id" | "created_at">> };
      reservas:        { Row: DbReserva;        Insert: Omit<DbReserva, "id" | "created_at" | "updated_at">;        Update: Partial<Omit<DbReserva, "id" | "created_at">> };
      pagos:           { Row: DbPago;           Insert: Omit<DbPago, "id" | "created_at" | "updated_at">;           Update: Partial<Omit<DbPago, "id" | "created_at">> };
      facturas:        { Row: DbFactura;        Insert: Omit<DbFactura, "id" | "created_at">;                       Update: Partial<Omit<DbFactura, "id" | "created_at">> };
      comentarios:     { Row: DbComentario;     Insert: Omit<DbComentario, "id" | "created_at" | "updated_at">;     Update: Partial<Omit<DbComentario, "id" | "created_at">> };
      calificaciones:  { Row: DbCalificacion;   Insert: Omit<DbCalificacion, "id" | "created_at">;                  Update: never };
      notificaciones:  { Row: DbNotificacion;   Insert: Omit<DbNotificacion, "id" | "created_at">;                  Update: Partial<Omit<DbNotificacion, "id" | "created_at">> };
      logs:            { Row: DbLog;            Insert: Omit<DbLog, "id" | "created_at">;                           Update: never };
      auditoria:       { Row: DbAuditoria;      Insert: Omit<DbAuditoria, "id" | "created_at">;                     Update: never };
    };
    Views: Record<string, never>;
    Functions: {
      get_resumen_ventas: {
        Args: { fecha_inicio: string; fecha_fin: string };
        Returns: { total_ventas: number; total_pedidos: number; ticket_promedio: number };
      };
      aplicar_cupon: {
        Args: { codigo: string; monto: number; cliente_id: number };
        Returns: { valido: boolean; descuento: number; mensaje: string };
      };
      calcular_puntos: {
        Args: { monto: number };
        Returns: number;
      };
    };
    Enums: {
      rol_nombre:       RolNombre;
      estado_pedido:    EstadoPedido;
      tipo_pedido:      TipoPedido;
      estado_pago:      EstadoPago;
      metodo_pago:      MetodoPago;
      estado_reserva:   EstadoReserva;
      tipo_movimiento:  TipoMovimiento;
      estado_producto:  EstadoProducto;
      tipo_promocion:   TipoPromocion;
      estado_empleado:  EstadoEmpleado;
    };
  };
}
