'use client'
/**
 * @fileoverview Admin Sidebar — BB Wings Management System
 * @description Sidebar colapsable del panel de administración con navegación
 * por rol y animaciones.
 * @version 1.0.0
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Tag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  Warehouse,
  CalendarRange,
  MessageSquare,
  Ticket,
  FileText,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Navigation Config ────────────────────────────────────────────────────

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin/dashboard",     icon: <LayoutDashboard className="h-4.5 w-4.5" />, label: "Dashboard" },
      { href: "/admin/pedidos",       icon: <ShoppingBag className="h-4.5 w-4.5" />,     label: "Pedidos", badge: "live" },
      { href: "/admin/notificaciones",icon: <Bell className="h-4.5 w-4.5" />,            label: "Notificaciones" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { href: "/admin/productos",     icon: <Package className="h-4.5 w-4.5" />,   label: "Productos" },
      { href: "/admin/categorias",    icon: <Tag className="h-4.5 w-4.5" />,        label: "Categorías" },
      { href: "/admin/inventario",    icon: <Warehouse className="h-4.5 w-4.5" />, label: "Inventario" },
    ],
  },
  {
    label: "Negocio",
    items: [
      { href: "/admin/clientes",      icon: <Users className="h-4.5 w-4.5" />,       label: "Clientes" },
      { href: "/admin/reservaciones", icon: <CalendarRange className="h-4.5 w-4.5" />,label: "Reservaciones" },
      { href: "/admin/promociones",   icon: <Ticket className="h-4.5 w-4.5" />,      label: "Promociones" },
      { href: "/admin/cupones",       icon: <MessageSquare className="h-4.5 w-4.5" />,label: "Cupones" },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/admin/reportes",      icon: <BarChart3 className="h-4.5 w-4.5" />,  label: "Reportes" },
      { href: "/admin/auditoria",     icon: <FileText className="h-4.5 w-4.5" />,   label: "Auditoría" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracion", icon: <Settings className="h-4.5 w-4.5" />, label: "Configuración" },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  userRole: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? "72px" : "var(--sidebar-width)";

  return (
    <aside
      style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      className="h-screen sticky top-0 flex flex-col bg-[#0d0d0d] border-r border-white/5 transition-all duration-300 overflow-hidden z-20"
      aria-label="Menú de administración"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary flex-shrink-0">
                <Flame className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-lg text-white tracking-wider truncate">
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
              className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary mx-auto"
            >
              <Flame className="h-4 w-4 text-white" aria-hidden="true" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { setIsCollapsed((prev) => !prev); }}
          className={cn(
            "flex items-center justify-center h-6 w-6 rounded-md text-gray-muted hover:text-white hover:bg-white/10 transition-all flex-shrink-0",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group label */}
            {!isCollapsed && (
              <p className="px-3 py-1.5 text-[10px] font-bold font-ui text-gray-muted/60 uppercase tracking-widest">
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
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium font-ui transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-white"
                      : "text-gray-muted hover:text-white hover:bg-white/5",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
                      aria-hidden="true"
                    />
                  )}

                  <span className="flex-shrink-0" aria-hidden="true">
                    {icon}
                  </span>

                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {badge === "live" && (
                        <span className="status-dot online" aria-label="En vivo" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}

            {/* Divider between groups */}
            {!isCollapsed && (
              <div className="h-px bg-white/5 my-2 mx-3" aria-hidden="true" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer — User role badge */}
      <div className="border-t border-white/5 px-3 py-3 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <span className="status-dot online" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-muted capitalize truncate">{userRole}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
