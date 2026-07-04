import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * @fileoverview POS Orders API Route — BB Wings Management System
 * @description Crea pedidos directamente desde el punto de venta (POS) para cajeros.
 * @version 1.0.0
 */

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Verificar autenticación y rol (cajero, admin, super_admin)
    const { data: { user: staffUser }, error: authError } = await supabase.auth.getUser();
    if (authError !== null || staffUser === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: perfilStaff } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", staffUser.id)
      .single();

    const perfilTyped = perfilStaff as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "cajero" && rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    // 2. Extraer cuerpo
    const body = await request.json();
    const {
      cliente_id,
      tipo,
      mesa_numero,
      direccion_entrega,
      notas,
      metodo_pago,
      monto_pagado,
      items
    } = body;

    if (!tipo || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Datos del pedido incompletos (tipo y productos requeridos)." }, { status: 400 });
    }

    // 3. Validar productos y calcular subtotal en el servidor
    const productIds = items.map((item) => item.producto_id);
    const { data: dbProducts, error: dbProductsError } = await adminSupabase
      .from("productos")
      .select("id, nombre, precio, disponible")
      .in("id", productIds);

    if (dbProductsError || !dbProducts) {
      return NextResponse.json({ success: false, error: "Error al verificar los productos en la base de datos." }, { status: 500 });
    }

    const typedProducts = (dbProducts || []) as { id: number; nombre: string; precio: number; disponible: boolean }[];
    const productsMap = new Map(typedProducts.map((p) => [p.id, p]));
    let subtotal = 0;
    const orderDetailsToInsert: any[] = [];

    for (const item of items) {
      const product = productsMap.get(item.producto_id);
      if (!product) {
        return NextResponse.json({ success: false, error: `El producto #${item.producto_id} no existe.` }, { status: 400 });
      }
      if (!product.disponible) {
        return NextResponse.json({ success: false, error: `El producto "${product.nombre}" ya no está disponible.` }, { status: 400 });
      }

      const itemSubtotal = item.cantidad * product.precio;
      subtotal += itemSubtotal;

      orderDetailsToInsert.push({
        producto_id: product.id,
        cantidad: item.cantidad,
        precio_unitario: product.precio,
        subtotal: itemSubtotal,
        notas: item.notas || null
      });
    }

    // Calcular impuestos y total (Sin IVA por tratarse de alimentos)
    const impuesto = 0;
    const total = subtotal;

    // 4. Generar número de pedido único para POS
    const fecha = new Date();
    const numeroPedido = `POS-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Mapear el tipo de pedido del POS al enum tipo_pedido de la base de datos
    const dbTipoPedidoMap: Record<string, string> = {
      mesa: "local",
      llevar: "para_llevar",
      domicilio: "delivery"
    };
    const dbTipo = dbTipoPedidoMap[tipo] || "local";

    // 5. Insertar pedido principal (se marca directamente como "confirmado" o "preparando" ya que lo ingresa el cajero)
    const { data: newOrder, error: orderInsertError } = await adminSupabase
      .from("pedidos")
      .insert({
        cliente_id: cliente_id ? parseInt(cliente_id, 10) : null,
        numero_pedido: numeroPedido,
        tipo: dbTipo,
        estado: "confirmado", // Confirmado de forma inmediata
        subtotal,
        descuento: 0,
        impuesto,
        total,
        notas: notas || null,
        direccion_entrega: tipo === "domicilio" ? (direccion_entrega || "Entregar en domicilio") : null,
        mesa_numero: tipo === "mesa" ? parseInt(mesa_numero, 10) : null,
        token_seguimiento: `TOK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      })
      .select("*")
      .single();

    if (orderInsertError || !newOrder) {
      return NextResponse.json({ success: false, error: `Error al crear el pedido: ${orderInsertError?.message}` }, { status: 500 });
    }

    // 6. Insertar los detalles del pedido
    const detailsWithOrderId = orderDetailsToInsert.map((detail) => ({
      ...detail,
      pedido_id: newOrder.id
    }));

    const { error: detailsInsertError } = await adminSupabase
      .from("detalle_pedido")
      .insert(detailsWithOrderId);

    if (detailsInsertError) {
      // Revertir pedido
      await adminSupabase.from("pedidos").delete().eq("id", newOrder.id);
      return NextResponse.json({ success: false, error: `Error al insertar detalles del pedido: ${detailsInsertError.message}` }, { status: 500 });
    }

    // 7. Insertar el pago
    const dbMetodoPago = metodo_pago === "tarjeta" ? "tarjeta_credito" : (metodo_pago || "efectivo");
    const cashValue = parseFloat(monto_pagado) || total;
    const cambioCalculado = dbMetodoPago === "efectivo" ? Math.max(0, cashValue - total) : 0;

    const { data: newPago, error: pagoInsertError } = await adminSupabase
      .from("pagos")
      .insert({
        pedido_id: newOrder.id,
        monto: total,
        metodo: dbMetodoPago,
        estado: "completado", // Completado de inmediato por caja
        monto_recibido: dbMetodoPago === "efectivo" ? cashValue : total,
        cambio: cambioCalculado,
        procesado_por: staffUser.id
      })
      .select("*")
      .single();

    if (pagoInsertError || !newPago) {
      console.error("Error al registrar pago en POS:", pagoInsertError?.message);
    } else {
      // 7.5. Generar la factura
      const folioFiscal = crypto.randomUUID();
      const numeroFactura = `FAC-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error: facturaInsertError } = await adminSupabase
        .from("facturas")
        .insert({
          pedido_id: newOrder.id,
          pago_id: newPago.id,
          numero_factura: numeroFactura,
          rfc_cliente: "XAXX010101000", // RFC genérico
          razon_social: "Público en General",
          cfdi_uso: "S01", // Sin efectos fiscales
          subtotal: subtotal,
          iva: impuesto,
          total: total,
          timbrada: true,
          folio_fiscal: folioFiscal
        });

      if (facturaInsertError) {
        console.error("Error al registrar factura en POS:", facturaInsertError.message);
      }
    }

    // 8. Acumular puntos al cliente si está registrado
    if (cliente_id) {
      const puntosNuevos = Math.floor(total * 0.10); // 10% de la compra se acumula en puntos
      
      const { data: currentClient } = await adminSupabase
        .from("clientes")
        .select("puntos_acumulados")
        .eq("id", parseInt(cliente_id, 10))
        .single();

      if (currentClient) {
        const nuevosPuntosTotales = (currentClient.puntos_acumulados || 0) + puntosNuevos;
        await adminSupabase
          .from("clientes")
          .update({ puntos_acumulados: nuevosPuntosTotales })
          .eq("id", parseInt(cliente_id, 10));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        pedido_id: newOrder.id,
        numero_pedido: newOrder.numero_pedido,
        total: newOrder.total,
        cambio: metodo_pago === "efectivo" && monto_pagado ? Math.max(0, monto_pagado - total) : 0
      }
    }, { status: 201 });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // 1. Verificar autenticación y rol
    const { data: { user: staffUser }, error: authError } = await supabase.auth.getUser();
    if (authError !== null || staffUser === null) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: perfilStaff } = await supabase
      .from("usuarios")
      .select("roles(nombre)")
      .eq("id", staffUser.id)
      .single();

    const perfilTyped = perfilStaff as unknown as { roles: { nombre: string } | null } | null;
    const rolNombre = perfilTyped?.roles?.nombre;

    if (rolNombre !== "cajero" && rolNombre !== "admin" && rolNombre !== "super_admin") {
      return NextResponse.json({ success: false, error: "Acceso no autorizado" }, { status: 403 });
    }

    // 2. Obtener los últimos 30 pedidos con detalles, productos y pagos
    const { data: pedidos, error: pedidosError } = await adminSupabase
      .from("pedidos")
      .select(`
        *,
        clientes (
          id,
          usuarios (
            nombre,
            apellido
          )
        ),
        detalle_pedido (
          *,
          productos (*)
        ),
        pagos (*)
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (pedidosError) {
      return NextResponse.json({ success: false, error: pedidosError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: pedidos });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 });
  }
}
