'use client'
/**
 * @fileoverview Admin Header — BB Wings Management System
 * @description Barra superior del panel admin con búsqueda, notificaciones y perfil.
 * @version 1.0.0
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";

// ─── Props ────────────────────────────────────────────────────────────────

interface AdminHeaderProps {
  userName: string;
  userRole: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutAction();
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0d0d0d]/50 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => { setSearchValue(e.target.value); }}
          placeholder="Buscar pedidos, productos..."
          aria-label="Búsqueda global"
          className="w-full h-9 pl-9 pr-4 text-sm bg-card border border-card-border rounded-xl text-white placeholder:text-gray-muted focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-gray-muted hover:text-white hover:bg-white/5 transition-all"
          aria-label="Notificaciones"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden="true" />
          {/* Unread dot */}
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border border-[#0d0d0d]"
            aria-hidden="true"
          />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10 mx-1" aria-hidden="true" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setIsUserMenuOpen((prev) => !prev); }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            id="admin-user-menu"
          >
            <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight max-w-[120px] truncate">
                {userName}
              </p>
              <p className="text-[10px] text-gray-muted capitalize">{userRole}</p>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-muted transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => { setIsUserMenuOpen(false); }}
                  aria-hidden="true"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  aria-labelledby="admin-user-menu"
                  className="absolute right-0 top-full mt-2 w-52 glass-strong border border-white/10 rounded-xl shadow-glass z-20 overflow-hidden py-1"
                >
                  {[
                    { href: "/admin/configuracion", icon: <Settings className="h-4 w-4" />, label: "Configuración" },
                    { href: "/perfil",              icon: <User className="h-4 w-4" />,     label: "Mi Perfil" },
                  ].map(({ href, icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-muted hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}

                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
