'use client'

import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils/formatters";
import { useToast } from "@/lib/store/ui.store";

interface RecentOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReprint: (order: any) => void;
}

export function RecentOrdersModal({
  isOpen,
  onClose,
  onReprint,
}: RecentOrdersModalProps) {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchRecentOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/pos/orders");
      const result = await res.json();
      if (result.success) {
        setRecentOrders(result.data || []);
      } else {
        toast.error("Error", result.error || "No se pudieron obtener los pedidos recientes.");
      }
    } catch {
      toast.error("Error", "Error de conexión al buscar pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentOrders();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pedidos Recientes POS"
      description="Listado de los últimos 30 pedidos procesados en caja para reimpresión de tickets."
      size="lg"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "60vh", overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.4)" }}>Cargando pedidos...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.4)" }}>No se encontraron pedidos.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>Pedido</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Fecha</th>
                <th style={{ padding: "8px", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Total</th>
                <th style={{ padding: "8px", textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const dateStr = new Date(order.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
                const typeLabel = order.tipo === "local" ? `Mesa ${order.mesa_numero || ""}` : (order.tipo === "para_llevar" ? "Llevar" : "Domi.");
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px", fontWeight: 700, color: "#fff" }}>{order.numero_pedido}</td>
                    <td style={{ padding: "8px", color: "rgba(255,255,255,0.6)" }}>{dateStr}</td>
                    <td style={{ padding: "8px", textTransform: "capitalize", color: "rgba(255,255,255,0.8)" }}>{typeLabel}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 800, color: "#ea580c" }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        onClick={() => onReprint(order)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "rgba(234, 88, 12, 0.1)",
                          border: "1px solid rgba(234, 88, 12, 0.2)",
                          color: "#ea580c",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(234, 88, 12, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(234, 88, 12, 0.1)";
                        }}
                      >
                        <Printer className="w-3 h-3" />
                        Reimprimir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}
