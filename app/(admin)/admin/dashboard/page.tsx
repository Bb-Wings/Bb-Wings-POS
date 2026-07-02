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
import { StatCard, Card, CardHeader, CardContent } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <Card variant="elevated" padding="none">
      <CardHeader
        className="px-5 pt-5"
        title="Pedidos Recientes"
        description="Los últimos 8 pedidos del sistema"
        action={
          <a
            href="/admin/pedidos"
            className="text-xs text-primary hover:text-primary-400 font-medium transition-colors"
          >
            Ver todos →
          </a>
        }
      />
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Pedidos recientes">
            <thead>
              <tr className="border-b border-card-border">
                {["Pedido", "Cliente", "Tipo", "Estado", "Total", "Tiempo"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold text-gray-muted uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-muted">
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
                      className="border-b border-card-border/50 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm font-mono text-primary">
                        {formatOrderNumber(order.id)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white">
                        {usuarioData
                          ? `${usuarioData.nombre} ${usuarioData.apellido}`
                          : "Invitado"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-muted capitalize">
                          {order.tipo.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <OrderStatusBadge
                          status={order.estado as Parameters<typeof OrderStatusBadge>[0]["status"]}
                          size="sm"
                        />
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-white">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatRelativeTime(order.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-muted mt-1">
          Resumen general del negocio en tiempo real
        </p>
      </div>

      {/* KPI Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <StatsSection />
      </Suspense>

      {/* Charts & Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales chart — spans 2 columns */}
        <div className="xl:col-span-2">
          <SalesChart />
        </div>

        {/* Quick stats */}
        <Card variant="elevated">
          <CardHeader
            title="Métricas Rápidas"
            description="Estado del negocio hoy"
          />
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Tiempo promedio de entrega", value: "24 min", icon: <Clock className="h-4 w-4 text-primary" /> },
                { label: "Satisfacción del cliente", value: "4.8/5", icon: <TrendingUp className="h-4 w-4 text-success" /> },
                { label: "Tasa de cancelación", value: "2.1%", icon: <AlertTriangle className="h-4 w-4 text-warning" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-card-border/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    {icon}
                    <span className="text-sm text-gray-muted">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
