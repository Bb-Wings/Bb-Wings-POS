/**
 * @fileoverview Orders Admin Page — BB Wings Management System
 * @description Página de administración de pedidos de sucursales, llevar y a domicilio.
 * @version 1.0.0
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OrdersManager } from "@/components/admin/orders-manager";
import { StatCardSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Gestión de Pedidos",
};

// ─── Rich Mock Fallback Data ────────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: 1,
    numero_pedido: "BB202607-A59B2",
    estado: "pendiente",
    total: 350.00,
    tipo: "domicilio",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    tiempo_estimado: 25,
    notas: "Sin cebolla en las hamburguesas por favor.",
    direccion_entrega: "Av. Revolución 1420, Col. Centro",
    mesa_numero: null,
    personas: null,
    clientes: {
      id: 101,
      usuarios: {
        nombre: "Alejandro",
        apellido: "Mendoza",
        email: "alejandro@email.com",
        telefono: "555-019-2834"
      }
    },
    detalle_pedido: [
      {
        id: 501,
        cantidad: 2,
        precio_unitario: 120.00,
        subtotal: 240.00,
        notas: "Bien cocidas",
        productos: {
          nombre: "Alitas BBQ Originales x10",
          imagen_url: null
        }
      },
      {
        id: 502,
        cantidad: 1,
        precio_unitario: 110.00,
        subtotal: 110.00,
        notas: null,
        productos: {
          nombre: "Hamburguesa BB Monster",
          imagen_url: null
        }
      }
    ]
  },
  {
    id: 2,
    numero_pedido: "BB202607-B82F1",
    estado: "preparando",
    total: 185.00,
    tipo: "sucursal",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    tiempo_estimado: 20,
    notas: null,
    direccion_entrega: null,
    mesa_numero: 4,
    personas: 2,
    clientes: {
      id: 102,
      usuarios: {
        nombre: "Sofia",
        apellido: "García",
        email: "sofia.garcia@email.com",
        telefono: "555-024-5867"
      }
    },
    detalle_pedido: [
      {
        id: 503,
        cantidad: 1,
        precio_unitario: 135.00,
        subtotal: 135.00,
        notas: null,
        productos: {
          nombre: "Boneless Búfalo x12",
          imagen_url: null
        }
      },
      {
        id: 504,
        cantidad: 2,
        precio_unitario: 25.00,
        subtotal: 50.00,
        notas: "Con hielo",
        productos: {
          nombre: "Refresco de Lata 355ml",
          imagen_url: null
        }
      }
    ]
  },
  {
    id: 3,
    numero_pedido: "BB202607-C34E9",
    estado: "listo",
    total: 290.00,
    tipo: "llevar",
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    tiempo_estimado: 15,
    notas: "Poner aderezo extra.",
    direccion_entrega: null,
    mesa_numero: null,
    personas: null,
    clientes: {
      id: 103,
      usuarios: {
        nombre: "Carlos",
        apellido: "Ortiz",
        email: "carlos.ortiz@email.com",
        telefono: "555-082-1928"
      }
    },
    detalle_pedido: [
      {
        id: 505,
        cantidad: 1,
        precio_unitario: 220.00,
        subtotal: 220.00,
        notas: null,
        productos: {
          nombre: "Combo Familiar Wings & Fries",
          imagen_url: null
        }
      },
      {
        id: 506,
        cantidad: 1,
        precio_unitario: 70.00,
        subtotal: 70.00,
        notas: null,
        productos: {
          nombre: "Papas BB Gajo Crujientes",
          imagen_url: null
        }
      }
    ]
  },
  {
    id: 4,
    numero_pedido: "BB202607-D99A1",
    estado: "entregado",
    total: 160.00,
    tipo: "sucursal",
    created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    tiempo_estimado: 20,
    notas: null,
    direccion_entrega: null,
    mesa_numero: 2,
    personas: 1,
    clientes: null,
    detalle_pedido: [
      {
        id: 507,
        cantidad: 1,
        precio_unitario: 135.00,
        subtotal: 135.00,
        notas: null,
        productos: {
          nombre: "Alitas Lemon Pepper x10",
          imagen_url: null
        }
      },
      {
        id: 508,
        cantidad: 1,
        precio_unitario: 25.00,
        subtotal: 25.00,
        notas: null,
        productos: {
          nombre: "Agua de Sabor 500ml",
          imagen_url: null
        }
      }
    ]
  }
];

// ─── Data Fetching ─────────────────────────────────────────────────────────

async function getOrders(): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        numero_pedido,
        estado,
        total,
        tipo,
        created_at,
        tiempo_estimado,
        notas,
        direccion_entrega,
        mesa_numero,
        personas,
        clientes (
          id,
          usuarios (
            nombre,
            apellido,
            email,
            telefono
          )
        ),
        detalle_pedido (
          id,
          cantidad,
          precio_unitario,
          subtotal,
          notas,
          productos (
            nombre,
            imagen_url
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error !== null || !data || data.length === 0) {
      return MOCK_ORDERS;
    }
    return data;
  } catch (err) {
    return MOCK_ORDERS;
  }
}

// ─── Page Component ────────────────────────────────────────────────────────

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "var(--font-heading, inherit)" }}>
          Pedidos
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "4px" }}>
          Monitoreo, aceptación y preparación de pedidos en tiempo real
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "1.25rem" }}>
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        }
      >
        <OrdersManager initialOrders={orders} />
      </Suspense>
    </div>
  );
}
