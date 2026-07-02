/**
 * @fileoverview Admin Dashboard Page — BB Wings Management System
 * @description Panel principal de administración con KPIs, gráficas de ventas,
 * pedidos recientes y alertas de inventario.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard, Card } from "@/components/ui/card";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/ui/badge";
import { SalesChart } from "@/components/admin/charts/sales-chart";
import { formatCurrency, formatRelativeTime, formatOrderNumber, calculateGrowth } from "@/lib/utils/formatters";

export const metadata: Metadata = {
  title: "Dashboard",
};

// ─── Data Fetching ─────────────────────────────────────────────────────────

async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const prevMonth = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: ventasHoy },
    { data: ventasMes },
    { data: ventasMesAnterior },
    { data: pedidosPendientes },
    { data: clientesNuevos },
    { count: totalClientes },
  ] = await Promise.all([
    supabase
      .from("pedidos")
      .select("total")
      .gte("created_at", `${today}T00:00:00`)
      .neq("estado", "cancelado"),
    supabase
      .from("pedidos")
      .select("total")
      .gte("created_at", lastMonth)
      .neq("estado", "cancelado"),
    supabase
      .from("pedidos")
      .select("total")
      .gte("created_at", prevMonth)
      .lt("created_at", lastMonth)
      .neq("estado", "cancelado"),
    supabase
      .from("pedidos")
      .select("id")
      .in("estado", ["pendiente", "confirmado", "preparando"]),
    supabase
      .from("usuarios")
      .select("id")
      .gte("created_at", lastMonth),
    supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true }),
  ]);

  const totalVentasHoy = ((ventasHoy as { total: number }[] | null) ?? []).reduce((acc, p) => acc + p.total, 0);
  const totalVentasMes = ((ventasMes as { total: number }[] | null) ?? []).reduce((acc, p) => acc + p.total, 0);
  const totalVentasMesAnterior = ((ventasMesAnterior as { total: number }[] | null) ?? []).reduce((acc, p) => acc + p.total, 0);
  const crecimientoVentas = calculateGrowth(totalVentasMes, totalVentasMesAnterior);

  return {
    ventasHoy: totalVentasHoy,
    ventasMes: totalVentasMes,
    crecimientoVentas,
    pedidosPendientes: pedidosPendientes?.length ?? 0,
    clientesNuevos: clientesNuevos?.length ?? 0,
    totalClientes: totalClientes ?? 0,
    ticketPromedio: (ventasMes?.length ?? 0) > 0
      ? totalVentasMes / (ventasMes?.length ?? 1)
      : 0,
  };
}

async function getRecentOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pedidos")
    .select(`
      id, numero_pedido, estado, total, tipo, created_at,
      clientes (usuarios (nombre, apellido))
    `)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data as any) ?? [];
}

/*
async function getLowStockAlerts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inventario")
    .select("*, productos(nombre)")
    .lte("cantidad_actual", supabase.rpc as unknown as number)
    .limit(5);
  // Simplificado — en producción usar RPC
  const { data: lowStock } = await supabase
    .from("inventario")
    .select(`
      id, cantidad_actual, cantidad_minima, unidad,
      productos (nombre)
    `)
    .limit(5);
  return lowStock ?? [];
}
*/

// ─── Sub-Components ────────────────────────────────────────────────────────

async function StatsSection() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "2rem" }}>
      <StatCard
        title="Ventas de Hoy"
        value={formatCurrency(stats.ventasHoy)}
        icon={<DollarSign className="h-5 w-5" />}
        iconColor="success"
        change={stats.crecimientoVentas}
        changeLabel="vs. mes anterior"
      />
      <StatCard
        title="Ventas del Mes"
        value={formatCurrency(stats.ventasMes)}
        icon={<TrendingUp className="h-5 w-5" />}
        iconColor="primary"
        change={stats.crecimientoVentas}
        changeLabel="vs. mes anterior"
      />
      <StatCard
        title="Pedidos Activos"
        value={String(stats.pedidosPendientes)}
        icon={<ShoppingBag className="h-5 w-5" />}
        iconColor="warning"
      />
      <StatCard
        title="Clientes Totales"
        value={stats.totalClientes.toLocaleString("es-MX")}
        icon={<Users className="h-5 w-5" />}
        iconColor="secondary"
        change={stats.clientesNuevos}
        changeLabel="nuevos este mes"
      />
    </div>
  );
}

async function RecentOrdersTable() {
  const orders = await getRecentOrders();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .recent-orders-link {
          color: #f97316;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.72rem;
          transition: color 0.2s ease;
        }
        .recent-orders-link:hover {
          color: #fb923c !important;
        }
        .recent-orders-row {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.2s ease;
        }
        .recent-orders-row:hover {
          background: rgba(255,255,255,0.01) !important;
        }
      `}} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
            Pedidos Recientes
          </h3>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
            Los últimos 8 pedidos del sistema
          </p>
        </div>
        <a
          href="/admin/pedidos"
          className="recent-orders-link"
        >
          Ver todos →
        </a>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Pedidos recientes">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Pedido", "Cliente", "Tipo", "Estado", "Total", "Tiempo"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "30px 16px", textAlign: "center", fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>
                  No hay pedidos recientes
                </td>
              </tr>
            ) : (
              orders.map((order: any) => {
                const clienteData = order.clientes;
                const usuarioData = clienteData && typeof clienteData === "object" && !Array.isArray(clienteData)
                  ? (clienteData as { usuarios: { nombre: string; apellido: string } | null }).usuarios
                  : null;

                return (
                  <tr
                    key={order.id}
                    className="recent-orders-row"
                  >
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", fontFamily: "monospace", color: "#f97316", fontWeight: 700 }}>
                      {formatOrderNumber(order.id)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>
                      {usuarioData
                        ? `${usuarioData.nombre} ${usuarioData.apellido}`
                        : "Invitado"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", textTransform: "capitalize" }}>
                      {order.tipo.replace("_", " ")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <OrderStatusBadge
                        status={order.estado as Parameters<typeof OrderStatusBadge>[0]["status"]}
                        size="sm"
                      />
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Clock style={{ width: "12px", height: "12px" }} aria-hidden="true" />
                        {formatRelativeTime(order.created_at)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Page header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "4px" }}>
          Resumen general del negocio en tiempo real
        </p>
      </div>

      {/* KPI Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "2rem" }}>
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <StatsSection />
      </Suspense>

      {/* Charts & Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3" style={{ gap: "2rem" }}>
        {/* Sales chart — spans 2 columns */}
        <div className="xl:col-span-2">
          <SalesChart />
        </div>

        {/* Quick stats */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
              Métricas Rápidas
            </h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
              Estado del negocio hoy
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Tiempo de entrega", value: "24 min", icon: <Clock style={{ width: "15px", height: "15px", color: "#f97316" }} /> },
              { label: "Satisfacción cliente", value: "4.8/5", icon: <TrendingUp style={{ width: "15px", height: "15px", color: "#22c55e" }} /> },
              { label: "Tasa cancelación", value: "2.1%", icon: <AlertTriangle style={{ width: "15px", height: "15px", color: "#eab308" }} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)"
                }}
                className="last:border-0 pb-0"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    {icon}
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>{label}</span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <Suspense
        fallback={
          <Card variant="elevated" padding="none">
            <div className="p-5 border-b border-card-border">
              <div className="h-5 w-40 bg-card-border rounded shimmer" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={6} />
            ))}
          </Card>
        }
      >
        <RecentOrdersTable />
      </Suspense>
    </div>
  );
}
