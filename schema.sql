-- ==========================================
-- BB WINGS MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: PostgreSQL / Supabase
-- Version: 1.0.0
-- ==========================================

-- ─── Clean Up (Optional) ───────────────────────────────────────────────────
-- DROP FUNCTION IF EXISTS aplicar_cupon(VARCHAR, NUMERIC, INTEGER);
-- DROP FUNCTION IF EXISTS calcular_puntos(NUMERIC);
-- DROP FUNCTION IF EXISTS get_resumen_ventas(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
-- DROP TABLE IF EXISTS auditoria CASCADE;
-- DROP TABLE IF EXISTS logs CASCADE;
-- DROP TABLE IF EXISTS notificaciones CASCADE;
-- DROP TABLE IF EXISTS calificaciones CASCADE;
-- DROP TABLE IF EXISTS comentarios CASCADE;
-- DROP TABLE IF EXISTS facturas CASCADE;
-- DROP TABLE IF EXISTS pagos CASCADE;
-- DROP TABLE IF EXISTS reservas CASCADE;
-- DROP TABLE IF EXISTS detalle_pedido CASCADE;
-- DROP TABLE IF EXISTS pedidos CASCADE;
-- DROP TABLE IF EXISTS cupones CASCADE;
-- DROP TABLE IF EXISTS promociones CASCADE;
-- DROP TABLE IF EXISTS movimientos CASCADE;
-- DROP TABLE IF EXISTS inventario CASCADE;
-- DROP TABLE IF EXISTS proveedores CASCADE;
-- DROP TABLE IF EXISTS imagenes CASCADE;
-- DROP TABLE IF EXISTS productos CASCADE;
-- DROP TABLE IF EXISTS categorias CASCADE;
-- DROP TABLE IF EXISTS empleados CASCADE;
-- DROP TABLE IF EXISTS clientes CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;
-- DROP TYPE IF EXISTS estado_empleado CASCADE;
-- DROP TYPE IF EXISTS tipo_promocion CASCADE;
-- DROP TYPE IF EXISTS estado_producto CASCADE;
-- DROP TYPE IF EXISTS tipo_movimiento CASCADE;
-- DROP TYPE IF EXISTS estado_reserva CASCADE;
-- DROP TYPE IF EXISTS metodo_pago CASCADE;
-- DROP TYPE IF EXISTS estado_pago CASCADE;
-- DROP TYPE IF EXISTS tipo_pedido CASCADE;
-- DROP TYPE IF EXISTS estado_pedido CASCADE;
-- DROP TYPE IF EXISTS rol_nombre CASCADE;

-- ─── Enums & Custom Types ──────────────────────────────────────────────────

CREATE TYPE rol_nombre AS ENUM (
    'super_admin',
    'admin',
    'cajero',
    'cocinero',
    'inventario',
    'marketing',
    'cliente'
);

CREATE TYPE estado_pedido AS ENUM (
    'pendiente',
    'confirmado',
    'preparando',
    'listo',
    'entregado',
    'cancelado'
);

CREATE TYPE tipo_pedido AS ENUM (
    'local',
    'para_llevar',
    'delivery',
    'drive_thru'
);

CREATE TYPE estado_pago AS ENUM (
    'pendiente',
    'completado',
    'fallido',
    'reembolsado'
);

CREATE TYPE metodo_pago AS ENUM (
    'efectivo',
    'tarjeta_credito',
    'tarjeta_debito',
    'transferencia',
    'qr',
    'puntos'
);

CREATE TYPE estado_reserva AS ENUM (
    'pendiente',
    'confirmada',
    'cancelada',
    'completada',
    'no_show'
);

CREATE TYPE tipo_movimiento AS ENUM (
    'entrada',
    'salida',
    'ajuste',
    'merma'
);

CREATE TYPE estado_producto AS ENUM (
    'activo',
    'inactivo',
    'agotado'
);

CREATE TYPE tipo_promocion AS ENUM (
    'porcentaje',
    'monto_fijo',
    '2x1',
    'happy_hour',
    'combo',
    'evento'
);

CREATE TYPE estado_empleado AS ENUM (
    'activo',
    'inactivo',
    'vacaciones',
    'baja'
);

-- ─── Common Trigger Function ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Tables ───────────────────────────────────────────────────────────────

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre rol_nombre UNIQUE NOT NULL,
    descripcion TEXT,
    permisos JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Usuarios
-- Nota: Si usas Supabase Auth, el campo 'id' puede hacer referencia a auth.users(id).
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    rol_id INTEGER REFERENCES roles(id) NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    nombre VARCHAR NOT NULL,
    apellido VARCHAR NOT NULL,
    telefono VARCHAR,
    avatar_url VARCHAR,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    direccion TEXT,
    ciudad VARCHAR,
    colonia VARCHAR,
    cp VARCHAR,
    puntos_acumulados INTEGER DEFAULT 0 NOT NULL,
    puntos_canjeados INTEGER DEFAULT 0 NOT NULL,
    nivel_fidelidad VARCHAR DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino')) NOT NULL,
    qr_code TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
    rol_id INTEGER REFERENCES roles(id) NOT NULL,
    numero_empleado VARCHAR UNIQUE NOT NULL,
    departamento VARCHAR,
    puesto VARCHAR,
    salario NUMERIC(10,2),
    fecha_ingreso DATE DEFAULT CURRENT_DATE NOT NULL,
    estado estado_empleado DEFAULT 'activo' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Categorias
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    imagen_url VARCHAR,
    slug VARCHAR UNIQUE NOT NULL,
    orden INTEGER DEFAULT 0 NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE RESTRICT NOT NULL,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    precio_costo NUMERIC(10,2),
    slug VARCHAR UNIQUE NOT NULL,
    sku VARCHAR UNIQUE,
    codigo_barras VARCHAR UNIQUE,
    imagen_principal VARCHAR,
    calorias INTEGER,
    es_nuevo BOOLEAN DEFAULT FALSE NOT NULL,
    es_popular BOOLEAN DEFAULT FALSE NOT NULL,
    es_vegetariano BOOLEAN DEFAULT FALSE NOT NULL,
    es_picante BOOLEAN DEFAULT FALSE NOT NULL,
    nivel_picante INTEGER CHECK (nivel_picante BETWEEN 1 AND 5),
    tiempo_preparacion INTEGER, -- en minutos
    disponible BOOLEAN DEFAULT TRUE NOT NULL,
    estado estado_producto DEFAULT 'activo' NOT NULL,
    orden INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Imagenes adicionales de productos
CREATE TABLE imagenes (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
    url VARCHAR NOT NULL,
    alt_text VARCHAR,
    es_principal BOOLEAN DEFAULT FALSE NOT NULL,
    orden INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    rfc VARCHAR,
    contacto VARCHAR,
    email VARCHAR,
    telefono VARCHAR,
    direccion TEXT,
    ciudad VARCHAR,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Inventario
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
    proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
    cantidad_actual NUMERIC(10,2) DEFAULT 0 NOT NULL,
    cantidad_minima NUMERIC(10,2) DEFAULT 0 NOT NULL,
    cantidad_maxima NUMERIC(10,2),
    unidad VARCHAR NOT NULL,
    ubicacion VARCHAR,
    lote VARCHAR,
    fecha_vencimiento DATE,
    costo_unitario NUMERIC(10,2),
    alerta_activa BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. Movimientos de Inventario
CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    inventario_id INTEGER REFERENCES inventario(id) ON DELETE CASCADE NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) NOT NULL,
    tipo tipo_movimiento NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL,
    cantidad_anterior NUMERIC(10,2) NOT NULL,
    cantidad_posterior NUMERIC(10,2) NOT NULL,
    motivo TEXT,
    referencia_id INTEGER, -- ID de pedido, compra o auditoría asociada
    costo_unitario NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. Promociones
CREATE TABLE promociones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    descripcion TEXT,
    tipo tipo_promocion NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    imagen_url VARCHAR,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    hora_inicio TIME,
    hora_fin TIME,
    dias_semana INTEGER[], -- Array de días (0=Dom, 1=Lun, etc.)
    activa BOOLEAN DEFAULT TRUE NOT NULL,
    limite_uso INTEGER,
    usos_actuales INTEGER DEFAULT 0 NOT NULL,
    minimo_compra NUMERIC(10,2),
    productos_ids INTEGER[],
    categorias_ids INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. Cupones de descuento
CREATE TABLE cupones (
    id SERIAL PRIMARY KEY,
    promocion_id INTEGER REFERENCES promociones(id) ON DELETE SET NULL,
    codigo VARCHAR UNIQUE NOT NULL,
    descripcion TEXT,
    descuento_tipo VARCHAR CHECK (descuento_tipo IN ('porcentaje', 'monto_fijo')) NOT NULL,
    descuento_valor NUMERIC(10,2) NOT NULL,
    minimo_compra NUMERIC(10,2),
    uso_maximo INTEGER,
    usos_actuales INTEGER DEFAULT 0 NOT NULL,
    uso_por_cliente INTEGER DEFAULT 1 NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. Pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    numero_pedido VARCHAR UNIQUE NOT NULL,
    tipo tipo_pedido NOT NULL,
    estado estado_pedido NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    descuento NUMERIC(10,2) DEFAULT 0 NOT NULL,
    impuesto NUMERIC(10,2) DEFAULT 0 NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    cupon_id INTEGER REFERENCES cupones(id) ON DELETE SET NULL,
    notas TEXT,
    direccion_entrega TEXT,
    tiempo_estimado INTEGER, -- en minutos
    tiempo_real INTEGER,
    mesa_numero VARCHAR,
    personas INTEGER,
    token_seguimiento VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. Detalle de Pedidos
CREATE TABLE detalle_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE NOT NULL,
    producto_id INTEGER REFERENCES productos(id) ON DELETE RESTRICT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    descuento NUMERIC(10,2) DEFAULT 0 NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    notas TEXT,
    modificadores JSONB, -- Extras, aderezos, nivel de picante
    estado VARCHAR DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparando', 'listo', 'cancelado')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 15. Reservaciones
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    nombre_contacto VARCHAR NOT NULL,
    telefono_contacto VARCHAR NOT NULL,
    email_contacto VARCHAR,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    personas INTEGER NOT NULL,
    mesa_assigned VARCHAR,
    estado estado_reserva NOT NULL,
    notas TEXT,
    confirmacion_token VARCHAR NOT NULL,
    recordatorio_enviado BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. Pagos
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE NOT NULL,
    metodo metodo_pago NOT NULL,
    estado estado_pago NOT NULL,
    monto NUMERIC(10,2) NOT NULL,
    monto_recibido NUMERIC(10,2),
    cambio NUMERIC(10,2),
    referencia_externa VARCHAR,
    ultimos_4 VARCHAR(4),
    procesado_por UUID REFERENCES usuarios(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. Facturación
CREATE TABLE facturas (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE NOT NULL,
    pago_id INTEGER REFERENCES pagos(id) ON DELETE RESTRICT NOT NULL,
    numero_factura VARCHAR UNIQUE NOT NULL,
    rfc_cliente VARCHAR,
    razon_social VARCHAR,
    cfdi_uso VARCHAR,
    subtotal NUMERIC(10,2) NOT NULL,
    iva NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    pdf_url VARCHAR,
    xml_url VARCHAR,
    timbrada BOOLEAN DEFAULT FALSE NOT NULL,
    folio_fiscal VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 18. Comentarios
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE NOT NULL,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
    texto TEXT NOT NULL,
    moderado BOOLEAN DEFAULT FALSE NOT NULL,
    visible BOOLEAN DEFAULT TRUE NOT NULL,
    respuesta_admin TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 19. Calificaciones / Reviews
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
    calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5) NOT NULL,
    categoria VARCHAR CHECK (categoria IN ('sabor', 'servicio', 'tiempo', 'limpieza', 'general')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 20. Notificaciones
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
    tipo VARCHAR CHECK (tipo IN ('pedido', 'promocion', 'reserva', 'sistema', 'puntos', 'stock')) NOT NULL,
    titulo VARCHAR NOT NULL,
    mensaje TEXT NOT NULL,
    datos JSONB,
    leida BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 21. Logs de Sistema
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nivel VARCHAR CHECK (nivel IN ('debug', 'info', 'warn', 'error', 'critical')) NOT NULL,
    modulo VARCHAR NOT NULL,
    accion VARCHAR NOT NULL,
    mensaje TEXT NOT NULL,
    datos JSONB,
    ip VARCHAR,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 22. Auditoría
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tabla VARCHAR NOT NULL,
    registro_id VARCHAR NOT NULL,
    accion VARCHAR CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ─── Triggers definition for updated_at ─────────────────────────────────────

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promociones_updated_at BEFORE UPDATE ON promociones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cupones_updated_at BEFORE UPDATE ON cupones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_detalle_pedido_updated_at BEFORE UPDATE ON detalle_pedido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comentarios_updated_at BEFORE UPDATE ON comentarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Functions and Stored Procedures ────────────────────────────────────────

-- 1. Resumen de Ventas
CREATE OR REPLACE FUNCTION get_resumen_ventas(fecha_inicio TIMESTAMP WITH TIME ZONE, fecha_fin TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (total_ventas NUMERIC, total_pedidos INTEGER, ticket_promedio NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(total), 0)::NUMERIC as total_ventas,
        COUNT(id)::INTEGER as total_pedidos,
        COALESCE(AVG(total), 0)::NUMERIC as ticket_promedio
    FROM pedidos
    WHERE created_at BETWEEN fecha_inicio AND fecha_fin;
END;
$$ LANGUAGE plpgsql;

-- 2. Calcular Puntos
CREATE OR REPLACE FUNCTION calcular_puntos(monto NUMERIC)
RETURNS INTEGER AS $$
BEGIN
    -- Regla básica: 1 punto por cada $10 gastados
    RETURN FLOOR(monto / 10)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 3. Aplicar Cupón
CREATE OR REPLACE FUNCTION aplicar_cupon(codigo VARCHAR, monto NUMERIC, cliente_id INTEGER)
RETURNS TABLE (valido BOOLEAN, descuento NUMERIC, mensaje VARCHAR) AS $$
DECLARE
    cupon_rec RECORD;
    usos_cliente INTEGER;
BEGIN
    -- Buscar cupón activo
    SELECT * INTO cupon_rec 
    FROM cupones 
    WHERE cupones.codigo = aplicar_cupon.codigo 
      AND cupones.activo = TRUE 
      AND NOW() BETWEEN cupones.fecha_inicio AND COALESCE(cupones.fecha_fin, '9999-12-31'::timestamp);
      
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, 'Cupón no encontrado, inactivo o vencido'::VARCHAR;
        RETURN;
    END IF;
    
    -- Validar mínimo de compra
    IF cupon_rec.minimo_compra IS NOT NULL AND monto < cupon_rec.minimo_compra THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, ('La compra mínima para este cupón es de $' || cupon_rec.minimo_compra)::VARCHAR;
        RETURN;
    END IF;
    
    -- Validar uso máximo global
    IF cupon_rec.uso_maximo IS NOT NULL AND cupon_rec.usos_actuales >= cupon_rec.uso_maximo THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, 'El cupón ha alcanzado su límite de usos'::VARCHAR;
        RETURN;
    END IF;
    
    -- Validar si es de cliente específico
    IF cupon_rec.cliente_id IS NOT NULL AND cupon_rec.cliente_id != aplicar_cupon.cliente_id THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, 'Este cupón no pertenece al cliente especificado'::VARCHAR;
        RETURN;
    END IF;
    
    -- Validar uso por cliente
    SELECT COUNT(*)::INTEGER INTO usos_cliente 
    FROM pedidos 
    WHERE pedidos.cliente_id = aplicar_cupon.cliente_id 
      AND pedidos.cupon_id = cupon_rec.id;
      
    IF usos_cliente >= cupon_rec.uso_por_cliente THEN
        RETURN QUERY SELECT FALSE, 0::NUMERIC, 'Has alcanzado el límite de usos para este cupón'::VARCHAR;
        RETURN;
    END IF;
    
    -- Calcular descuento
    IF cupon_rec.descuento_tipo = 'porcentaje' THEN
        descuento := ROUND((monto * cupon_rec.descuento_valor / 100), 2);
    ELSE
        descuento := LEAST(cupon_rec.descuento_valor, monto);
    END IF;
    
    RETURN QUERY SELECT TRUE, descuento, 'Cupón aplicado con éxito'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- ─── Seed Initial Data (Roles) ──────────────────────────────────────────────

INSERT INTO roles (nombre, descripcion, permisos) VALUES
('super_admin', 'Acceso total al sistema', '{"*": true}'::jsonb),
('admin', 'Administrador general', '{"dashboard": true, "pedidos": true, "usuarios": true, "productos": true, "inventario": true, "reportes": true}'::jsonb),
('cajero', 'Personal de caja y punto de venta', '{"pos": true, "pedidos": true, "clientes": true}'::jsonb),
('cocinero', 'Personal de cocina', '{"kitchen": true, "pedidos": true}'::jsonb),
('inventario', 'Gestor de almacén e inventario', '{"inventario": true, "proveedores": true}'::jsonb),
('marketing', 'Gestor de promociones y campañas', '{"promociones": true, "cupones": true, "clientes": true}'::jsonb),
('cliente', 'Cliente final del restaurante', '{"perfil": true, "pedidos": true, "favoritos": true}'::jsonb)
ON CONFLICT (nombre) DO NOTHING;
