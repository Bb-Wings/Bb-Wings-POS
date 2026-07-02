'use client'
/**
 * @fileoverview Orders Manager — BB Wings Admin Panel
 * @description Gestor interactivo de pedidos en tiempo real con filtros,
 * buscador, vista de detalles tipo split-screen y transiciones de estado.
 * @version 1.0.0
 */

import { useState, useTransition } from "react";
import {
  Clock,
  Search,
  Check,
  X,
  MapPin,
  User,
  Phone,
  Mail,
  Utensils,
  Bike,
  Printer,
  Package,
  Store,
  AlertTriangle,
} from "lucide-react";
import { updateOrderStatusAction } from "@/lib/actions/orders.actions";
import { formatCurrency, formatRelativeTime, formatOrderNumber } from "@/lib/utils/formatters";

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface OrderItem {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas: string | null;
  productos: {
    nombre: string;
    imagen_url: string | null;
  } | null;
}

export interface Order {
  id: number;
  numero_pedido: string;
  estado: string;
  total: number;
  tipo: string;
  created_at: string;
  tiempo_estimado: number;
  notas: string | null;
  direccion_entrega: string | null;
  mesa_numero: number | null;
  personas: number | null;
  clientes: {
    id: number;
    usuarios: {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string | null;
    } | null;
  } | null;
  detalle_pedido: OrderItem[];
}

interface OrdersManagerProps {
  initialOrders: Order[];
}

type StatusType = "todos" | "pendiente" | "confirmado" | "preparando" | "listo" | "entregado" | "cancelado";

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(
    initialOrders && initialOrders.length > 0 && initialOrders[0] ? initialOrders[0].id : null
  );
  const [statusFilter, setStatusFilter] = useState<StatusType>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Get Selected Order ───────────────────────────────────────────────────
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // ─── Status Stats ─────────────────────────────────────────────────────────
  const pendingCount = orders.filter((o) => o.estado === "pendiente").length;
  const preparingCount = orders.filter((o) => o.estado === "confirmado" || o.estado === "preparando").length;
  const readyCount = orders.filter((o) => o.estado === "listo").length;
  const deliveredCount = orders.filter((o) => o.estado === "entregado").length;

  // ─── Filter Logic ─────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    if (statusFilter !== "todos") {
      if (statusFilter === "pendiente" && order.estado !== "pendiente") return false;
      if (statusFilter === "preparando" && order.estado !== "confirmado" && order.estado !== "preparando") return false;
      if (statusFilter === "listo" && order.estado !== "listo") return false;
      if (statusFilter === "entregado" && order.estado !== "entregado") return false;
      if (statusFilter === "cancelado" && order.estado !== "cancelado") return false;
    }

    // 2. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const numMatch = order.numero_pedido.toLowerCase().includes(q) || String(order.id).includes(q);
      const nameMatch = order.clientes?.usuarios
        ? `${order.clientes.usuarios.nombre} ${order.clientes.usuarios.apellido}`.toLowerCase().includes(q)
        : "invitado".includes(q);
      
      return numMatch || nameMatch;
    }

    return true;
  });

  // ─── Handle Status Transition ─────────────────────────────────────────────
  const handleUpdateStatus = (orderId: number, nextStatus: "confirmado" | "preparando" | "listo" | "entregado" | "cancelado") => {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const result = await updateOrderStatusAction(orderId, nextStatus);
        if (result.success) {
          // Local update
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, estado: nextStatus } : o))
          );
        } else {
          setErrorMsg(result.error || "No se pudo actualizar el estado.");
        }
      } catch {
        setErrorMsg("Error de conexión al servidor.");
      }
    });
  };

  // ─── Print Order Ticket ───────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  // ─── Helper Badge Colors ──────────────────────────────────────────────────
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "pendiente":
        return { bg: "rgba(234,179,8,0.1)", color: "#eab308", border: "rgba(234,179,8,0.2)", label: "Pendiente" };
      case "confirmado":
        return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "rgba(59,130,246,0.2)", label: "Confirmado" };
      case "preparando":
        return { bg: "rgba(168,85,247,0.1)", color: "#a855f7", border: "rgba(168,85,247,0.2)", label: "En Cocina" };
      case "listo":
        return { bg: "rgba(34,197,94,0.1)", color: "#22c55e", border: "rgba(34,197,94,0.2)", label: "Listo / Para entregar" };
      case "entregado":
        return { bg: "rgba(156,163,175,0.1)", color: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.06)", label: "Entregado" };
      case "cancelado":
        return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", border: "rgba(239,68,68,0.2)", label: "Cancelado" };
      default:
        return { bg: "rgba(255,255,255,0.05)", color: "#fff", border: "rgba(255,255,255,0.1)", label: status };
    }
  };

  const getDeliveryTypeStyles = (type: string) => {
    switch (type) {
      case "domicilio":
        return { icon: <Bike style={{ width: "13px", height: "13px" }} />, bg: "rgba(234,88,12,0.1)", color: "#f97316", label: "A Domicilio" };
      case "llevar":
        return { icon: <Package style={{ width: "13px", height: "13px" }} />, bg: "rgba(14,165,233,0.1)", color: "#0ea5e9", label: "Para Llevar" };
      case "sucursal":
        return { icon: <Store style={{ width: "13px", height: "13px" }} />, bg: "rgba(34,197,94,0.1)", color: "#22c55e", label: "En Sucursal" };
      default:
        return { icon: <Utensils style={{ width: "13px", height: "13px" }} />, bg: "rgba(255,255,255,0.05)", color: "#fff", label: type };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* ─── Stylesheet ─── */}
      <style dangerouslySetInnerHTML={{__html: `
        .order-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .order-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.09);
        }
        .order-card.selected {
          background: rgba(234,88,12,0.06);
          border-color: rgba(234,88,12,0.3);
        }
        .filter-tab {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.55);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          alignItems: center;
          gap: 6px;
        }
        .filter-tab:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .filter-tab.active {
          background: #f97316;
          color: #fff;
          border-color: #f97316;
          box-shadow: 0 4px 12px rgba(249,115,22,0.3);
        }
        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .action-btn-primary {
          background: #f97316;
          color: #fff;
        }
        .action-btn-primary:hover {
          background: #ea580c;
          box-shadow: 0 4px 15px rgba(234,88,12,0.4);
        }
        .action-btn-secondary {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
        }
        .action-btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
        }
        .action-btn-danger {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          color: #ef4444;
        }
        .action-btn-danger:hover {
          background: rgba(239,68,68,0.15);
          box-shadow: 0 4px 15px rgba(239,68,68,0.25);
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #fff;
            color: #000;
            padding: 20px;
          }
        }
      `}} />

      {/* ─── KPI Summary Cards ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
        {[
          { title: "Nuevos Pendientes", value: pendingCount, color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.15)" },
          { title: "En Preparación", value: preparingCount, color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.15)" },
          { title: "Listos para Entrega", value: readyCount, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
          { title: "Entregados Hoy", value: deliveredCount, color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.05)" },
        ].map((card) => (
          <div
            key={card.title}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
              border: `1px solid ${card.border}`,
              borderRadius: "14px",
              padding: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              position: "relative",
            }}
          >
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
                {card.title}
              </p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", margin: "4px 0 0" }}>
                {card.value}
              </p>
            </div>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: card.bg,
              border: `1px solid ${card.border}`,
              color: card.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.1rem"
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px",
          padding: "1rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
          <Search style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(255,255,255,0.35)" }} />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px",
              fontSize: "0.85rem",
              color: "#fff",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(234,88,12,0.4)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {([
            { id: "todos", label: "Todos" },
            { id: "pendiente", label: "Pendientes" },
            { id: "preparando", label: "En Cocina" },
            { id: "listo", label: "Listos" },
            { id: "entregado", label: "Entregados" },
            { id: "cancelado", label: "Cancelados" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`filter-tab ${statusFilter === tab.id ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontSize: "0.82rem" }}>
          <AlertTriangle style={{ width: "15px", height: "15px" }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ─── Main Content Split Layout ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.75rem", alignItems: "flex-start" }}>
        {/* Left Side: Orders list */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "1.25rem",
            padding: "1.25rem",
            boxShadow: "0 10px 35px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "680px",
            overflowY: "auto",
          }}
        >
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", marginBottom: "4px" }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Lista de Pedidos ({filteredOrders.length})
            </h3>
          </div>

          {filteredOrders.length === 0 ? (
            <div style={{ padding: "40px 10px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>
              Ningún pedido coincide con los filtros.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const status = getStatusBadgeStyles(order.estado);
              const type = getDeliveryTypeStyles(order.tipo);
              const customerName = order.clientes?.usuarios
                ? `${order.clientes.usuarios.nombre} ${order.clientes.usuarios.apellido}`
                : "Invitado";

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`order-card ${selectedOrderId === order.id ? "selected" : ""}`}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>
                      {formatOrderNumber(order.id)}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock style={{ width: "11px", height: "11px" }} />
                      {formatRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 650, color: "rgba(255,255,255,0.7)" }}>
                        {customerName}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                        {order.detalle_pedido.reduce((acc, curr) => acc + curr.cantidad, 0)} items • {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: type.bg,
                        color: type.color,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {type.icon}
                        {type.label}
                      </span>

                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: status.bg,
                        color: status.color,
                        border: `1px solid ${status.border}`
                      }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed View */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            boxShadow: "0 10px 35px rgba(0,0,0,0.2)",
            position: "relative",
            minHeight: "450px"
          }}
        >
          {selectedOrder ? (
            <div id="print-area" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Header Details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "monospace" }}>
                      {formatOrderNumber(selectedOrder.id)}
                    </h2>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      background: getDeliveryTypeStyles(selectedOrder.tipo).bg,
                      color: getDeliveryTypeStyles(selectedOrder.tipo).color,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {getDeliveryTypeStyles(selectedOrder.tipo).icon}
                      {getDeliveryTypeStyles(selectedOrder.tipo).label}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
                    Recibido: {new Date(selectedOrder.created_at).toLocaleString("es-MX")} ({formatRelativeTime(selectedOrder.created_at)})
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handlePrint}
                    className="action-btn action-btn-secondary"
                    style={{ padding: "8px 12px" }}
                    title="Imprimir ticket de cocina"
                  >
                    <Printer style={{ width: "15px", height: "15px" }} />
                    <span style={{ fontSize: "0.75rem" }}>Ticket</span>
                  </button>
                  <span style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: getStatusBadgeStyles(selectedOrder.estado).bg,
                    color: getStatusBadgeStyles(selectedOrder.estado).color,
                    border: `1px solid ${getStatusBadgeStyles(selectedOrder.estado).border}`,
                    alignSelf: "center"
                  }}>
                    {getStatusBadgeStyles(selectedOrder.estado).label.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ─ Transition Step Indicators ─ */}
              {selectedOrder.estado !== "cancelado" && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", padding: "10px 0 20px" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "25px", height: "2px", background: "rgba(255,255,255,0.06)", zIndex: 1 }} />
                  {([
                    { key: "pendiente", label: "Pendiente" },
                    { key: "confirmado", label: "Confirmado" },
                    { key: "preparando", label: "En Cocina" },
                    { key: "listo", label: "Listo" },
                    { key: "entregado", label: "Entregado" }
                  ] as const).map((step, idx) => {
                    const statesOrder = ["pendiente", "confirmado", "preparando", "listo", "entregado"];
                    const currentIdx = statesOrder.indexOf(selectedOrder.estado);
                    const stepIdx = statesOrder.indexOf(step.key);
                    
                    const isCompleted = stepIdx <= currentIdx;
                    const isActive = step.key === selectedOrder.estado;

                    return (
                      <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, position: "relative", flex: 1 }}>
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: isActive ? "#f97316" : isCompleted ? "rgba(249,115,22,0.2)" : "rgba(18,18,18,0.9)",
                            border: isActive ? "2px solid #fff" : isCompleted ? "2px solid #f97316" : "2px solid rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            color: isActive ? "#fff" : isCompleted ? "#f97316" : "rgba(255,255,255,0.3)",
                            transition: "all 0.3s ease"
                          }}
                        >
                          {isCompleted && !isActive ? "✓" : idx + 1}
                        </div>
                        <span style={{ fontSize: "0.65rem", marginTop: "6px", fontWeight: isActive || isCompleted ? 700 : 500, color: isActive ? "#fff" : isCompleted ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)", textAlign: "center" }}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons based on current state */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  {selectedOrder.estado === "pendiente" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "confirmado")}
                      disabled={isPending}
                      className="action-btn action-btn-primary"
                    >
                      <Check style={{ width: "16px", height: "16px" }} />
                      Aceptar y Confirmar
                    </button>
                  )}

                  {selectedOrder.estado === "confirmado" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "preparando")}
                      disabled={isPending}
                      className="action-btn action-btn-primary"
                    >
                      <Package style={{ width: "16px", height: "16px" }} />
                      Iniciar Preparación
                    </button>
                  )}

                  {selectedOrder.estado === "preparando" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "listo")}
                      disabled={isPending}
                      className="action-btn action-btn-primary"
                    >
                      <Check style={{ width: "16px", height: "16px" }} />
                      Listo para Entrega
                    </button>
                  )}

                  {selectedOrder.estado === "listo" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "entregado")}
                      disabled={isPending}
                      className="action-btn action-btn-primary"
                    >
                      <Check style={{ width: "16px", height: "16px" }} />
                      Marcar como Entregado
                    </button>
                  )}
                </div>

                {selectedOrder.estado !== "entregado" && selectedOrder.estado !== "cancelado" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "cancelado")}
                    disabled={isPending}
                    className="action-btn action-btn-danger"
                  >
                    <X style={{ width: "14px", height: "14px" }} />
                    Cancelar Pedido
                  </button>
                )}
              </div>

              {/* Customer & Location Info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                    Cliente
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User style={{ width: "14px", height: "14px", color: "#f97316" }} />
                      {selectedOrder.clientes?.usuarios
                        ? `${selectedOrder.clientes.usuarios.nombre} ${selectedOrder.clientes.usuarios.apellido}`
                        : "Cliente Invitado"}
                    </span>
                    {selectedOrder.clientes?.usuarios?.telefono && (
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
                        {selectedOrder.clientes.usuarios.telefono}
                      </span>
                    )}
                    {selectedOrder.clientes?.usuarios?.email && (
                      <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail style={{ width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
                        {selectedOrder.clientes.usuarios.email}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                    Entrega
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {selectedOrder.tipo === "domicilio" && (
                      <span style={{ fontSize: "0.82rem", color: "#fff", display: "flex", alignItems: "flex-start", gap: "6px", lineHeight: 1.3 }}>
                        <MapPin style={{ width: "14px", height: "14px", color: "#f97316", flexShrink: 0, marginTop: "2px" }} />
                        {selectedOrder.direccion_entrega || "No especificada"}
                      </span>
                    )}
                    {selectedOrder.tipo === "sucursal" && (
                      <>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Store style={{ width: "14px", height: "14px", color: "#22c55e" }} />
                          Mesa #{selectedOrder.mesa_numero ?? "N/A"}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)" }}>
                          Personas: {selectedOrder.personas ?? "N/A"}
                        </span>
                      </>
                    )}
                    {selectedOrder.tipo === "llevar" && (
                      <span style={{ fontSize: "0.82rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Package style={{ width: "14px", height: "14px", color: "#0ea5e9" }} />
                        Para recoger en sucursal
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "6px" }}>
                  Productos Pedidos
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOrder.detalle_pedido.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }} className="last:border-0 pb-0">
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#f97316" }}>
                            {item.cantidad}x
                          </span>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                            {item.productos?.nombre || "Producto"}
                          </span>
                        </div>
                        {item.notas && (
                          <p style={{ fontSize: "0.75rem", color: "#eab308", margin: "4px 0 0 24px", fontStyle: "italic" }}>
                            Nota: {item.notas}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                        {formatCurrency(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes block if any */}
              {selectedOrder.notas && (
                <div style={{ background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.1)", borderRadius: "12px", padding: "12px" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#eab308", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                    Notas del Cliente
                  </p>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", margin: 0, fontStyle: "italic" }}>
                    &ldquo;{selectedOrder.notas}&rdquo;
                  </p>
                </div>
              )}

              {/* Totals Summary */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                <div style={{ display: "flex", gap: "20px", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{formatCurrency(selectedOrder.total / 1.16)}</span>
                </div>
                <div style={{ display: "flex", gap: "20px", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
                  <span>IVA (16%):</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{formatCurrency((selectedOrder.total / 1.16) * 0.16)}</span>
                </div>
                <div style={{ display: "flex", gap: "20px", fontSize: "1rem", color: "#fff", fontWeight: 800, marginTop: "4px" }}>
                  <span>Total:</span>
                  <span style={{ color: "#f97316" }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.3)" }}>
              <Package style={{ width: "40px", height: "40px", marginBottom: "10px" }} />
              <span>Selecciona un pedido para ver los detalles.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
