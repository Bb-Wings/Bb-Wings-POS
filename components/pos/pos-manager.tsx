'use client'

/**
 * @fileoverview POS Manager Component — BB Wings Terminal de Ventas
 * @description Pantalla completa interactiva del punto de venta para cajeros.
 * @version 1.0.0
 */

import { useState, useTransition, CSSProperties } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Send,
  User,
  ShoppingBag,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import type { DbProducto } from "@/types/database.types";
import { useToast } from "@/lib/store/ui.store";
import { formatCurrency } from "@/lib/utils/formatters";
import { Modal } from "@/components/ui/modal";
import { RecentOrdersModal } from "@/components/pos/recent-orders-modal";

// ─── Interfaces ────────────────────────────────────────────────────────────

interface ClientRecord {
  id: number;
  puntos_acumulados: number;
  usuarios: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

interface CartItem {
  product: DbProducto;
  cantidad: number;
  notas: string;
}

interface PosManagerProps {
  initialCategories: { id: number; nombre: string }[];
  initialProducts: DbProducto[];
  initialClients: ClientRecord[];
}

export function PosManager({
  initialCategories,
  initialProducts,
  initialClients,
}: PosManagerProps) {
  const [products] = useState<DbProducto[]>(initialProducts || []);
  const [categories] = useState<{ id: number; nombre: string }[]>(initialCategories || []);
  const [clients] = useState<ClientRecord[]>(initialClients || []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Configuraciones de orden
  const [orderType, setOrderType] = useState<"mesa" | "llevar" | "domicilio">("mesa");
  const [tableNumber, setTableNumber] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("general");
  const [orderNotes, setOrderNotes] = useState("");

  // Cobro
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "transferencia">("efectivo");
  const [amountPaid, setAmountPaid] = useState("");
  const [isPending, startTransition] = useTransition();

  // Pedidos Recientes
  const [isRecentOrdersModalOpen, setIsRecentOrdersModalOpen] = useState(false);

  const toast = useToast();

  const handleOpenRecentOrders = () => {
    setIsRecentOrdersModalOpen(true);
  };

  // ─── Cart Helpers ─────────────────────────────────────────────────────────

  const addToCart = (product: DbProducto) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { product, cantidad: 1, notas: "" }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.cantidad + delta;
            return { ...item, cantidad: nextQty };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const updateItemNotes = (productId: number, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notas: notes } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes("");
    setDeliveryAddress("");
    setTableNumber("1");
    setSelectedClientId("general");
  };

  // ─── Totals Calculation ───────────────────────────────────────────────────

  const subtotal = cart.reduce((acc, item) => acc + item.cantidad * item.product.precio, 0);
  const tax = 0; // Sin IVA por tratarse de alimentos
  const total = subtotal;

  // ─── Checkout Flow ────────────────────────────────────────────────────────

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      toast.error("Carrito vacío", "Agrega al menos un producto para cobrar.");
      return;
    }
    setAmountPaid(String(total));
    setIsPayModalOpen(true);
  };

  const printReceipt = (numeroPedido: string, change: number) => {
    const clientName = selectedClientId === "general"
      ? "Público en General"
      : (() => {
          const c = clients.find(cl => String(cl.id) === selectedClientId);
          return c?.usuarios ? `${c.usuarios.nombre} ${c.usuarios.apellido}` : "Cliente Registrado";
        })();

    const ticketHtml = `
      <html>
        <head>
          <title>Ticket ${numeroPedido}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 54mm;
              margin: 0;
              padding: 2mm 1mm;
              font-size: 9px;
              color: #000;
              background: #fff;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .header { margin-bottom: 2mm; }
            .logo { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
            .divider { border-top: 1px dashed #000; margin: 1.5mm 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 0.5mm; font-size: 9px; }
            td { padding: 0.5mm 0; vertical-align: top; font-size: 9px; }
            .totals td { padding: 0.3mm 0; }
            .footer { margin-top: 4mm; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="header center">
            <div class="logo">BB WINGS</div>
            <div>GESTIÓN DE CUENTAS</div>
            <div>Sucursal Central</div>
            <div class="divider"></div>
            <div><strong>TICKET DE COMPRA</strong></div>
            <div>${numeroPedido}</div>
            <div>Fecha: ${new Date().toLocaleString('es-MX')}</div>
            <div>Tipo: ${orderType.toUpperCase()} ${orderType === 'mesa' ? `(Mesa ${tableNumber})` : ''}</div>
            <div>Cajero: ${clientName}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">CANT</th>
                <th style="width: 60%;">DESCRIPCIÓN</th>
                <th class="right" style="width: 30%;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr>
                  <td>${item.cantidad}</td>
                  <td>
                    ${item.product.nombre}
                    ${item.notas ? `<br/><span style="font-size: 9px; font-style: italic;">* ${item.notas}</span>` : ''}
                  </td>
                  <td class="right">${formatCurrency(item.product.precio * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td class="right">${formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td>IVA (0%):</td>
              <td class="right">$0.00</td>
            </tr>
            <tr class="bold">
              <td>TOTAL:</td>
              <td class="right">${formatCurrency(total)}</td>
            </tr>
            <tr><td colspan="2"><div class="divider"></div></td></tr>
            <tr>
              <td>Método de Pago:</td>
              <td class="right" style="text-transform: capitalize;">${paymentMethod}</td>
            </tr>
            <tr>
              <td>Monto Recibido:</td>
              <td class="right">${formatCurrency(paymentMethod === 'efectivo' ? parseFloat(amountPaid) || total : total)}</td>
            </tr>
            <tr>
              <td>Cambio:</td>
              <td class="right">${formatCurrency(change)}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div class="footer center">
            <p class="bold">¡GRACIAS POR SU PREFERENCIA!</p>
            <p>Para facturar ingrese a:<br/>bbwings.com/facturacion</p>
            <p>Este no es un comprobante fiscal.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (printWindow) {
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    } else {
      toast.error("Bloqueador de ventanas", "Permite las ventanas emergentes para imprimir el ticket.");
    }
  };

  const printReceiptGeneric = (order: any) => {
    const clientName = order.clientes?.usuarios
      ? `${order.clientes.usuarios.nombre} ${order.clientes.usuarios.apellido}`
      : "Público en General";

    const orderTypeStr = order.tipo === "local" ? "mesa" : (order.tipo === "para_llevar" ? "llevar" : "domicilio");
    const tableNumberStr = order.mesa_numero || "";
    
    const items = order.detalle_pedido || [];
    const payment = order.pagos?.[0] || {};
    const methodStr = payment.metodo || "efectivo";
    const amountPaidVal = payment.monto_recibido || order.total;
    const changeVal = payment.cambio || 0;

    const ticketHtml = `
      <html>
        <head>
          <title>Ticket ${order.numero_pedido}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 54mm;
              margin: 0;
              padding: 2mm 1mm;
              font-size: 9px;
              color: #000;
              background: #fff;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .header { margin-bottom: 2mm; }
            .logo { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
            .divider { border-top: 1px dashed #000; margin: 1.5mm 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; padding-bottom: 0.5mm; font-size: 9px; }
            td { padding: 0.5mm 0; vertical-align: top; font-size: 9px; }
            .totals td { padding: 0.3mm 0; }
            .footer { margin-top: 4mm; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="header center">
            <div class="logo">BB WINGS</div>
            <div>GESTIÓN DE CUENTAS</div>
            <div>Sucursal Central</div>
            <div class="divider"></div>
            <div><strong>TICKET DE COMPRA (REIMPRESIÓN)</strong></div>
            <div>${order.numero_pedido}</div>
            <div>Fecha: ${new Date(order.created_at).toLocaleString('es-MX')}</div>
            <div>Tipo: ${orderTypeStr.toUpperCase()} ${orderTypeStr === 'mesa' ? `(Mesa ${tableNumberStr})` : ''}</div>
            <div>Cajero: ${clientName}</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 10%;">CANT</th>
                <th style="width: 60%;">DESCRIPCIÓN</th>
                <th class="right" style="width: 30%;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>${item.cantidad}</td>
                  <td>
                    ${item.productos?.nombre || 'Producto'}
                    ${item.notas ? `<br/><span style="font-size: 9px; font-style: italic;">* ${item.notas}</span>` : ''}
                  </td>
                  <td class="right">${formatCurrency(item.precio_unitario * item.cantidad)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td class="right">${formatCurrency(order.subtotal)}</td>
            </tr>
            <tr>
              <td>IVA (0%):</td>
              <td class="right">$0.00</td>
            </tr>
            <tr class="bold">
              <td>TOTAL:</td>
              <td class="right">${formatCurrency(order.total)}</td>
            </tr>
            <tr><td colspan="2"><div class="divider"></div></td></tr>
            <tr>
              <td>Método de Pago:</td>
              <td class="right" style="text-transform: capitalize;">${methodStr === 'tarjeta_credito' ? 'Tarjeta' : methodStr}</td>
            </tr>
            <tr>
              <td>Monto Recibido:</td>
              <td class="right">${formatCurrency(amountPaidVal)}</td>
            </tr>
            <tr>
              <td>Cambio:</td>
              <td class="right">${formatCurrency(changeVal)}</td>
            </tr>
          </table>

          <div class="divider"></div>

          <div class="footer center">
            <p class="bold">¡GRACIAS POR SU PREFERENCIA!</p>
            <p>Para facturar ingrese a:<br/>bbwings.com/facturacion</p>
            <p>Este no es un comprobante fiscal.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (printWindow) {
      printWindow.document.write(ticketHtml);
      printWindow.document.close();
    } else {
      toast.error("Bloqueador de ventanas", "Permite las ventanas emergentes para imprimir el ticket.");
    }
  };

  const handlePlaceOrder = () => {
    const cashValue = parseFloat(amountPaid) || 0;
    if (paymentMethod === "efectivo" && cashValue < total) {
      toast.error("Pago insuficiente", "El monto recibido debe ser mayor o igual al total.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          cliente_id: selectedClientId === "general" ? null : selectedClientId,
          tipo: orderType,
          mesa_numero: orderType === "mesa" ? tableNumber : null,
          direccion_entrega: orderType === "domicilio" ? deliveryAddress : null,
          notas: orderNotes,
          metodo_pago: paymentMethod,
          monto_pagado: paymentMethod === "efectivo" ? cashValue : total,
          items: cart.map((item) => ({
            producto_id: item.product.id,
            cantidad: item.cantidad,
            notas: item.notas || null,
          })),
        };

        const res = await fetch("/api/pos/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.success) {
          const change = result.data.cambio;
          toast.success(
            "Pedido creado",
            `Pedido ${result.data.numero_pedido} registrado. ${
              paymentMethod === "efectivo" && change > 0 ? `Cambio a entregar: ${formatCurrency(change)}` : ""
            }`
          );
          setIsPayModalOpen(false);
          printReceipt(result.data.numero_pedido, change);
          clearCart();
        } else {
          toast.error("Error al registrar", result.error || "No se pudo colocar el pedido.");
        }
      } catch {
        toast.error("Error", "Error de conexión con el servidor.");
      }
    });
  };

  // ─── Filters ──────────────────────────────────────────────────────────────

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategoryId === "all" || prod.categoria_id === selectedCategoryId;
    const matchesSearch = prod.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ─── Styles ───────────────────────────────────────────────────────────────

  const containerStyle: CSSProperties = {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "#0c0c0c",
    color: "#fff",
    overflow: "hidden",
    fontFamily: "var(--font-ui, inherit)",
  };

  const mainPanelStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "1.25rem",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  };

  const sidebarCartStyle: CSSProperties = {
    width: "400px",
    display: "flex",
    flexDirection: "column",
    background: "#121212",
    overflow: "hidden",
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexShrink: 0,
  };

  const categoryTabStyle = (active: boolean): CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "8px",
    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
    background: active ? "linear-gradient(90deg, #d61f2c, #ea580c)" : "rgba(255,255,255,0.02)",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  });

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#fff",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div style={containerStyle}>
      {/* ── PANEL DE CATÁLOGO (IZQUIERDO) ── */}
      <div style={mainPanelStyle}>
        {/* Header con Buscador */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a
              href="/admin/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>BB WINGS POS</h1>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Terminal de Pedidos</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={handleOpenRecentOrders}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                color: "#fff",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              <ClipboardList className="w-4 h-4 text-[#ea580c]" />
              Ver Recientes
            </button>

            <div style={{ position: "relative", width: "260px" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "14px",
                  height: "14px",
                  color: "rgba(255,255,255,0.3)",
                }}
              />
              <input
                type="text"
                placeholder="Buscar platillo o bebida..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "32px", height: "36px" }}
              />
            </div>
          </div>
        </div>

        {/* Tabs de Categorías */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "1.25rem",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSelectedCategoryId("all")}
            style={categoryTabStyle(selectedCategoryId === "all")}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              style={categoryTabStyle(selectedCategoryId === cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grid de Productos */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
            gap: "0.85rem",
            paddingBottom: "1rem",
          }}
        >
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => addToCart(prod)}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s",
                height: "165px",
                flexShrink: 0,
              }}
              className="hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-0.5"
            >
              {/* Imagen o portada */}
              <div
                style={{
                  height: "95px",
                  width: "100%",
                  background: prod.imagen_principal ? `url(${prod.imagen_principal}) center/cover no-repeat` : "linear-gradient(135deg, #181818 0%, #111 100%)",
                  flexShrink: 0,
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                }}
              />
              {/* Info */}
              <div style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0, minHeight: 0 }}>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#fff",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.2,
                  }}
                >
                  {prod.nombre}
                </span>
                <span style={{ fontSize: "0.82rem", color: "#ea580c", fontWeight: 800, marginTop: "2px" }}>
                  {formatCurrency(prod.precio)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CARRITO / DETALLE PEDIDO (DERECHO) ── */}
      <div style={sidebarCartStyle}>
        {/* Header Carrito */}
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag className="w-4 h-4 text-[#ea580c]" />
            <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>Detalle de Pedido</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
            >
              Vaciar
            </button>
          )}
        </div>

        {/* Configuración de entrega / cliente */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.01)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {/* Tipo de orden */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
            {(["mesa", "llevar", "domicilio"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                style={{
                  padding: "6px",
                  borderRadius: "6px",
                  border: orderType === t ? "none" : "1px solid rgba(255,255,255,0.08)",
                  background: orderType === t ? "#ea580c" : "rgba(255,255,255,0.02)",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Campos dinámicos según tipo de orden */}
          {orderType === "mesa" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Número de Mesa:</span>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                  outline: "none",
                }}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={String(i + 1)} style={{ background: "#111" }}>Mesa {i + 1}</option>
                ))}
              </select>
            </div>
          )}

          {orderType === "domicilio" && (
            <input
              type="text"
              placeholder="Dirección completa de entrega..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              style={{ ...inputStyle, padding: "6px 10px", fontSize: "0.8rem" }}
            />
          )}

          {/* Selector de Cliente */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <User className="w-3.5 h-3.5 text-rgba(255,255,255,0.3)" />
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                color: "#fff",
                padding: "4px 8px",
                fontSize: "0.8rem",
                outline: "none",
              }}
            >
              <option value="general" style={{ background: "#111" }}>Cliente General (Mostrador)</option>
              {clients.map((c) => (
                <option key={c.id} value={String(c.id)} style={{ background: "#111" }}>
                  {c.usuarios?.nombre} {c.usuarios?.apellido} ({c.puntos_acumulados || 0} pts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {cart.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "rgba(255,255,255,0.25)" }}>
              <ShoppingBag className="w-8 h-8" />
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>El pedido está vacío</span>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  paddingBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, flex: 1 }}>{item.product.nombre}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>
                    {formatCurrency(item.product.precio * item.cantidad)}
                  </span>
                </div>

                {/* Modificador e Item Notes */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Notas (ej: sin salsa, doble queso)..."
                    value={item.notas}
                    onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px dashed rgba(255,255,255,0.1)",
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.5)",
                      outline: "none",
                      padding: "2px 0",
                    }}
                  />

                  {/* Qty Selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", padding: "2px" }}>
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", padding: "2px" }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, minWidth: "16px", textAlign: "center" }}>{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", padding: "2px" }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", padding: "2px" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totales y Botón de Pago */}
        <div
          style={{
            padding: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.3)",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Notas generales del pedido..."
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            style={{ ...inputStyle, padding: "6px 10px", fontSize: "0.78rem", background: "rgba(255,255,255,0.01)" }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal:</span>
              <span style={{ color: "#fff" }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>IVA (16%):</span>
              <span style={{ color: "#fff" }}>{formatCurrency(tax)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
              <span>Total a Cobrar:</span>
              <span style={{ color: "#ea580c" }}>{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            style={{
              width: "100%",
              height: "44px",
              background: "linear-gradient(90deg, #d61f2c, #ea580c)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(234, 88, 12, 0.25)",
              opacity: cart.length === 0 ? 0.5 : 1,
            }}
          >
            Cobrar e Imprimir
          </button>
        </div>
      </div>

      {/* ─── MODAL COBRO / PAGO ─── */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Procesar Pago en Caja"
        description="Selecciona el método de pago y registra el cobro para completar el pedido."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Total */}
          <div style={{ textAlign: "center", padding: "1rem", background: "rgba(234, 88, 12, 0.04)", border: "1px solid rgba(234, 88, 12, 0.15)", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>TOTAL NETO A PAGAR</span>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#ea580c", margin: "4px 0 0" }}>{formatCurrency(total)}</h2>
          </div>

          {/* Método de pago */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
              Método de Pago
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[
                { type: "efectivo", label: "Efectivo", icon: <Banknote className="w-4 h-4" /> },
                { type: "tarjeta", label: "Tarjeta", icon: <CreditCard className="w-4 h-4" /> },
                { type: "transferencia", label: "Transf.", icon: <Send className="w-4 h-4" /> },
              ].map((m) => (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setPaymentMethod(m.type as any)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: paymentMethod === m.type ? "none" : "1px solid rgba(255,255,255,0.08)",
                    background: paymentMethod === m.type ? "#ea580c" : "rgba(255,255,255,0.02)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto recibido (Solo Efectivo) */}
          {paymentMethod === "efectivo" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Monto Recibido *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  style={{ ...inputStyle, height: "40px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "rgba(255, 255, 255, 0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
                  Cambio a Entregar
                </label>
                <div
                  style={{
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: (parseFloat(amountPaid) || 0) >= total ? "#22c55e" : "#ef4444",
                  }}
                >
                  {formatCurrency(Math.max(0, (parseFloat(amountPaid) || 0) - total))}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "1rem",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "1.25rem",
            }}
          >
            <button
              onClick={() => setIsPayModalOpen(false)}
              disabled={isPending}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isPending || (paymentMethod === "efectivo" && (parseFloat(amountPaid) || 0) < total)}
              style={{
                background: "linear-gradient(90deg, #d61f2c, #ea580c)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(234, 88, 12, 0.2)",
              }}
            >
              {isPending ? "Procesando..." : "Confirmar y Colocar Pedido"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Pedidos Recientes para Reimpresión */}
      <RecentOrdersModal
        isOpen={isRecentOrdersModalOpen}
        onClose={() => setIsRecentOrdersModalOpen(false)}
        onReprint={printReceiptGeneric}
      />
    </div>
  );
}
