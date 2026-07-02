'use server'
/**
 * @fileoverview Orders Server Actions — BB Wings Management System
 * @description Server Actions para creación, actualización y gestión de pedidos.
 * @version 1.0.0
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/order.schema";
import type { ActionResult } from "./auth.actions";
import type { CheckoutFormValues } from "@/lib/validations/order.schema";
import type { CartItem } from "@/types/store.types";

interface DBProducto {
  id: number;
  precio: number;
  nombre: string;
  disponible: boolean;
}

// ─── Create Order Action ──────────────────────────────────────────────────

/**
 * Crea un nuevo pedido con sus detalles.
 * Valida stock, aplica cupón y calcula totales en el servidor.
 */
export async function createOrderAction(
  formData: CheckoutFormValues,
  cartItems: CartItem[]
): Promise<ActionResult<{ pedidoId: number; numeroPedido: string; trackingToken: string }>> {
  // ── Validación básica ─────────────────────────────────────────────────────
  const parsed = checkoutSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  if (cartItems.length === 0) {
    return { success: false, error: "El carrito está vacío." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Debes iniciar sesión para hacer un pedido." };
  }

  const adminSupabase = createAdminClient();

  // ── Obtener cliente ───────────────────────────────────────────────────────
  const { data: cliente } = await adminSupabase
    .from("clientes")
    .select("id")
    .eq("usuario_id", user.id)
    .single();

  // ── Validar y calcular precios ────────────────────────────────────────────
  const productoIds = cartItems.map((item) => item.productoId);
  const { data: productos } = await adminSupabase
    .from("productos")
    .select("id, precio, nombre, disponible")
    .in("id", productoIds);

  if (!productos) {
    return { success: false, error: "Error al verificar los productos." };
  }

  // Verificar disponibilidad y recalcular precios desde DB (no confiar en el cliente)
  const preciosMap = new Map((productos as unknown as DBProducto[]).map((p) => [p.id, p]));
  let subtotal = 0;

  for (const item of cartItems) {
    const producto = preciosMap.get(item.productoId);
    if (!producto) {
      return { success: false, error: `Producto #${item.productoId} no encontrado.` };
    }
    if (!producto.disponible) {
      return { success: false, error: `"${producto.nombre}" ya no está disponible.` };
    }
    subtotal += item.cantidad * producto.precio;
  }
  subtotal = Math.round(subtotal * 100) / 100;

  // ── Validar cupón ─────────────────────────────────────────────────────────
  let descuento = 0;
  let cuponId: number | null = null;

  if (parsed.data.cuponCodigo) {
    const { data: cupon } = await adminSupabase
      .from("cupones")
      .select("*")
      .eq("codigo", parsed.data.cuponCodigo.toUpperCase())
      .eq("activo", true)
      .single();

    if (cupon) {
      const ahora = new Date().toISOString();
      const dentroDeRango =
        ahora >= cupon.fecha_inicio &&
        (!cupon.fecha_fin || ahora <= cupon.fecha_fin);
      const bajeLimite =
        cupon.uso_maximo === null || cupon.usos_actuales < cupon.uso_maximo;
      const minimoOk =
        !cupon.minimo_compra || subtotal >= cupon.minimo_compra;

      if (dentroDeRango && bajeLimite && minimoOk) {
        cuponId = cupon.id;
        if (cupon.descuento_tipo === "porcentaje") {
          descuento = Math.round(subtotal * (cupon.descuento_valor / 100) * 100) / 100;
        } else {
          descuento = Math.min(cupon.descuento_valor, subtotal);
        }
      }
    }
  }

  const baseImponible = subtotal - descuento;
  const impuesto = Math.round(baseImponible * 0.16 * 100) / 100;
  const total = Math.round((baseImponible + impuesto) * 100) / 100;

  // ── Generar número de pedido y token ─────────────────────────────────────
  const fecha = new Date();
  const numeroPedido = `BB${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const trackingToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // ── Crear pedido ──────────────────────────────────────────────────────────
  const { data: pedido, error: pedidoError } = await adminSupabase
    .from("pedidos")
    .insert({
      cliente_id: cliente?.id ?? null,
      numero_pedido: numeroPedido,
      tipo: parsed.data.tipo,
      estado: "pendiente",
      subtotal,
      descuento,
      impuesto,
      total,
      cupon_id: cuponId,
      notas: parsed.data.notas ?? null,
      direccion_entrega: parsed.data.direccionEntrega ?? null,
      mesa_numero: parsed.data.mesaNumero ?? null,
      personas: parsed.data.personas ?? null,
      token_seguimiento: trackingToken,
      tiempo_estimado: 25, // default 25 minutos
    })
    .select("id")
    .single();

  if (pedidoError || !pedido) {
    return { success: false, error: "Error al crear el pedido. Intenta de nuevo." };
  }

  // ── Crear detalles del pedido ─────────────────────────────────────────────
  const detalles = cartItems.map((item) => {
    const producto = preciosMap.get(item.productoId);
    const precioUnitario = producto?.precio ?? item.precio;
    const itemSubtotal = Math.round(item.cantidad * precioUnitario * 100) / 100;

    return {
      pedido_id: pedido.id,
      producto_id: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: precioUnitario,
      descuento: 0,
      subtotal: itemSubtotal,
      notas: item.notas,
      modificadores: item.modificadores,
      estado: "pendiente" as const,
    };
  });

  const { error: detallesError } = await adminSupabase
    .from("detalle_pedido")
    .insert(detalles);

  if (detallesError) {
    // Rollback del pedido
    await adminSupabase.from("pedidos").delete().eq("id", pedido.id);
    return { success: false, error: "Error al procesar los detalles del pedido." };
  }

  // ── Incrementar uso del cupón ──────────────────────────────────────────────
  if (cuponId) {
    await adminSupabase.rpc("calcular_puntos", { monto: total });
    await adminSupabase
      .from("cupones")
      .update({ usos_actuales: adminSupabase.rpc })
      .eq("id", cuponId);
  }

  // ── Notificación al cliente ────────────────────────────────────────────────
  if (user.id) {
    await adminSupabase.from("notificaciones").insert({
      usuario_id: user.id,
      tipo: "pedido",
      titulo: "¡Pedido recibido!",
      mensaje: `Tu pedido ${numeroPedido} ha sido recibido. Tiempo estimado: 25 min.`,
      datos: { pedidoId: pedido.id, numeroPedido },
    });
  }

  revalidatePath("/pedidos");
  return {
    success: true,
    data: {
      pedidoId: pedido.id,
      numeroPedido,
      trackingToken,
    },
  };
}

// ─── Update Order Status Action ───────────────────────────────────────────

/**
 * Actualiza el estado de un pedido. Solo para empleados autorizados.
 */
export async function updateOrderStatusAction(
  pedidoId: number,
  nuevoEstado: "confirmado" | "preparando" | "listo" | "entregado" | "cancelado"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado." };
  }

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("pedidos")
    .update({ estado: nuevoEstado })
    .eq("id", pedidoId);

  if (error) {
    return { success: false, error: "Error al actualizar el estado del pedido." };
  }

  // Notificar al cliente si el pedido está listo
  if (nuevoEstado === "listo") {
    const { data: pedido } = await adminSupabase
      .from("pedidos")
      .select("cliente_id, numero_pedido, clientes(usuario_id)")
      .eq("id", pedidoId)
      .single();

    if (pedido?.clientes && !Array.isArray(pedido.clientes)) {
      const clienteData = pedido.clientes as { usuario_id: string };
      await adminSupabase.from("notificaciones").insert({
        usuario_id: clienteData.usuario_id,
        tipo: "pedido",
        titulo: "¡Tu pedido está listo!",
        mensaje: `Tu pedido ${pedido.numero_pedido} está listo para ser entregado.`,
        datos: { pedidoId },
      });
    }
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/kitchen");
  return { success: true };
}
