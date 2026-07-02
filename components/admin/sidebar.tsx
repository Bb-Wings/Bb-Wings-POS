'use client'
/**
 * @fileoverview Admin Sidebar — BB Wings Management System
 * @description Sidebar colapsable del panel de administración con navegación
 * por rol y animaciones. Estilos completamente inline.
 * @version 2.0.0
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag, BarChart3,
  Settings, ChevronLeft, ChevronRight, Flame, Warehouse,
  CalendarRange, MessageSquare, Ticket, FileText, Bell,
} from "lucide-react";

// ─── Navigation Config ────────────────────────────────────────────────────

interface NavItem  { href: string; icon: React.ReactNode; label: string; badge?: string }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin/dashboard",      icon: <LayoutDashboard />, label: "Dashboard" },
      { href: "/admin/pedidos",         icon: <ShoppingBag />,     label: "Pedidos",         badge: "live" },
      { href: "/admin/notificaciones",  icon: <Bell />,            label: "Notificaciones" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos",   icon: <Package />,   label: "Productos" },
      { href: "/admin/categorias",  icon: <Tag />,        label: "Categorías" },
      { href: "/admin/inventario",  icon: <Warehouse />,  label: "Inventario" },
    ],
  },
  {
    label: "Negocio",
    items: [
      { href: "/admin/clientes",       icon: <Users />,         label: "Clientes" },
      { href: "/admin/reservaciones",  icon: <CalendarRange />, label: "Reservaciones" },
      { href: "/admin/promociones",    icon: <Ticket />,         label: "Promociones" },
      { href: "/admin/cupones",        icon: <MessageSquare />, label: "Cupones" },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/admin/reportes",   icon: <BarChart3 />, label: "Reportes" },
      { href: "/admin/auditoria",  icon: <FileText />,  label: "Auditoría" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracion", icon: <Settings />, label: "Configuración" },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────

interface AdminSidebarProps { userRole: string }

// ─── Component ────────────────────────────────────────────────────────────

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const W = isCollapsed ? "72px" : "var(--sidebar-width, 240px)";

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "#0d0d0d",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        transition: "width 0.3s ease, min-width 0.3s ease",
        overflow: "hidden",
        zIndex: 20,
        flexShrink: 0,
      }}
      aria-label="Menú de administración"
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          padding: "0 1rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}
            >
              <div
                style={{
                  width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                  background: "linear-gradient(135deg, #d61f2c, #ea580c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(214,31,44,0.3)",
                }}
              >
                <Flame style={{ width: "15px", height: "15px", color: "#fff" }} aria-hidden="true" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display, inherit)",
                  fontSize: "1rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                BB WINGS
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                width: "30px", height: "30px", borderRadius: "8px", margin: "0 auto",
                background: "linear-gradient(135deg, #d61f2c, #ea580c)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Flame style={{ width: "15px", height: "15px", color: "#fff" }} aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setIsCollapsed((p) => !p); }}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "26px",
            height: "26px",
            borderRadius: "6px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.35)",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s ease, color 0.15s ease",
            marginLeft: isCollapsed ? "auto" : "0",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color = "rgba(255,255,255,0.35)";
          }}
        >
          {isCollapsed
            ? <ChevronRight style={{ width: "14px", height: "14px" }} />
            : <ChevronLeft  style={{ width: "14px", height: "14px" }} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0.5rem" }}
        aria-label="Navegación principal"
      >
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label} style={{ marginBottom: "4px" }}>
            {/* Group label */}
            {!isCollapsed && (
              <p
                style={{
                  padding: "6px 10px",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {group.label}
              </p>
            )}

            {/* Items */}
            {group.items.map(({ href, icon, label, badge }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  title={isCollapsed ? label : undefined}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "10px",
                    padding: isCollapsed ? "10px 8px" : "9px 10px",
                    marginBottom: "2px",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    background: isActive ? "rgba(234,88,12,0.1)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                  }}
                  onMouseEnter={(e) => {
                    if (isActive) return;
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,0.05)";
                    el.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (isActive) return;
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "rgba(255,255,255,0.45)";
                  }}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "3px",
                        height: "18px",
                        background: "#ea580c",
                        borderRadius: "0 3px 3px 0",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <span
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "18px",
                      height: "18px",
                      color: isActive ? "#f97316" : "inherit",
                    }}
                  >
                    {icon}
                  </span>

                  {/* Label + badge */}
                  {!isCollapsed && (
                    <>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {label}
                      </span>
                      {badge === "live" && (
                        <span
                          aria-label="En vivo"
                          style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background: "#22d3ee",
                            flexShrink: 0,
                            boxShadow: "0 0 6px rgba(34,211,238,0.6)",
                          }}
                        />
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {/* Divider between groups */}
            {!isCollapsed && gi < NAV_GROUPS.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.05)",
                  margin: "6px 8px",
                }}
              />
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer — Role badge ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "0.75rem",
          flexShrink: 0,
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "rgba(234,88,12,0.06)",
              border: "1px solid rgba(234,88,12,0.12)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#4ade80",
                flexShrink: 0,
                boxShadow: "0 0 6px rgba(74,222,128,0.5)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "capitalize",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userRole || "Admin"}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 6px rgba(74,222,128,0.5)",
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
