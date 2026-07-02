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
    <div
      style={{
        background: "rgba(18,18,18,0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
      }}
    >
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.72rem", margin: "2px 0" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>{p.dataKey}:</span>
          <span style={{ fontWeight: 700, color: p.dataKey === "ventas" ? "#ea580c" : "#fff" }}>
            {p.dataKey === "ventas"
              ? `$${p.value.toLocaleString("es-MX")}`
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
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "1.25rem",
        padding: "1.5rem",
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
            Ventas de la Semana
          </h3>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
            Ingresos y pedidos de los últimos 7 días
          </p>
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            color: "#22c55e",
            background: "rgba(34,197,94,0.08)",
            padding: "2px 8px",
            borderRadius: "6px",
            border: "1px solid rgba(34,197,94,0.15)",
            fontWeight: 700,
          }}
        >
          ↑ 12.4%
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={DEMO_DATA}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#d61f2c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVentasLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#d61f2c" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.03)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.35)" }}
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
            stroke="url(#colorVentasLine)"
            strokeWidth={3}
            fill="url(#colorVentas)"
            dot={false}
            activeDot={{ r: 5, fill: "#ea580c", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
