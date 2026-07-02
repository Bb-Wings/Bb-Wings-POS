'use client'
/**
 * @fileoverview Sales Chart — BB Wings Management System
 * @description Gráfica de ventas de los últimos 7 días usando Recharts.
 * @version 1.0.0
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// ─── Demo Data ─────────────────────────────────────────────────────────────

const DEMO_DATA = [
  { day: "Lun", ventas: 12400, pedidos: 38 },
  { day: "Mar", ventas: 15800, pedidos: 52 },
  { day: "Mié", ventas: 11200, pedidos: 34 },
  { day: "Jue", ventas: 18600, pedidos: 61 },
  { day: "Vie", ventas: 24800, pedidos: 84 },
  { day: "Sáb", ventas: 31200, pedidos: 103 },
  { day: "Dom", ventas: 28400, pedidos: 92 },
];

// ─── Custom Tooltip ────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-strong border border-white/10 rounded-xl p-3 shadow-glass">
      <p className="text-xs font-semibold text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="text-gray-muted capitalize">{p.dataKey}:</span>
          <span className="font-bold text-white">
            {p.dataKey === "ventas"
              ? `$${(p.value / 1000).toFixed(1)}k`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────

export function SalesChart() {
  return (
    <Card variant="elevated">
      <CardHeader
        title="Ventas de la Semana"
        description="Ingresos y pedidos de los últimos 7 días"
        action={
          <span className="text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">
            ↑ 12.4%
          </span>
        }
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={DEMO_DATA}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D61F2C" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#D61F2C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)" }}
            />
            <Area
              type="monotone"
              dataKey="ventas"
              stroke="#D61F2C"
              strokeWidth={2}
              fill="url(#colorVentas)"
              dot={false}
              activeDot={{ r: 4, fill: "#D61F2C", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
