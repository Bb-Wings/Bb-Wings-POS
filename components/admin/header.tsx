'use client'
/**
 * @fileoverview Admin Header — BB Wings Management System
 * @description Barra superior del panel admin con búsqueda, notificaciones y perfil.
 * Estilos completamente inline.
 * @version 2.0.0
 */

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth.actions";
import { useAuthStore } from "@/lib/store/auth.store";

// ─── Props ────────────────────────────────────────────────────────────────

interface AdminHeaderProps {
  userName: string;
  userRole: string;
}

// ─── Component ────────────────────────────────────────────────────────────

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    useAuthStore.getState().logout();
    await logoutAction();
  };

  return (
    <header
      style={{
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(13,13,13,0.7)",
        backdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: 1, maxWidth: "320px" }}>
        <Search
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "15px",
            height: "15px",
            color: "rgba(255,255,255,0.3)",
            pointerEvents: "none",
          }}
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => { setSearchValue(e.target.value); }}
          onFocus={() => { setSearchFocused(true); }}
          onBlur={() => { setSearchFocused(false); }}
          placeholder="Buscar pedidos, productos..."
          aria-label="Búsqueda global"
          style={{
            width: "100%",
            height: "36px",
            paddingLeft: "36px",
            paddingRight: "16px",
            fontSize: "0.82rem",
            background: searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${searchFocused ? "rgba(234,88,12,0.4)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "10px",
            color: "#fff",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: searchFocused ? "0 0 0 3px rgba(234,88,12,0.08)" : "none",
          }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "1rem" }}>

        {/* Notification bell */}
        <button
          aria-label="Notificaciones"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <Bell style={{ width: "17px", height: "17px" }} aria-hidden="true" />
          {/* Unread dot */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "7px",
              right: "7px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#ea580c",
              border: "1.5px solid #0d0d0d",
              boxShadow: "0 0 6px rgba(234,88,12,0.6)",
            }}
          />
        </button>

        {/* Vertical divider */}
        <div
          aria-hidden="true"
          style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.08)", margin: "0 4px" }}
        />

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setIsUserMenuOpen((p) => !p); }}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
            id="admin-user-menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(234,88,12,0.3), rgba(214,31,44,0.2))",
                border: "1px solid rgba(234,88,12,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#f97316" }}>
                {initials || "AD"}
              </span>
            </div>

            {/* Name + role (hidden on small screens via className) */}
            <div className="hidden sm:block" style={{ textAlign: "left" }}>
              <p
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1.2,
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userName || "Admin"}
              </p>
              <p
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "capitalize",
                }}
              >
                {userRole}
              </p>
            </div>

            <ChevronDown
              style={{
                width: "13px",
                height: "13px",
                color: "rgba(255,255,255,0.35)",
                transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
              aria-hidden="true"
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 10 }}
                  onClick={() => { setIsUserMenuOpen(false); }}
                  aria-hidden="true"
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  aria-labelledby="admin-user-menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: "210px",
                    background: "rgba(18,18,18,0.97)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "14px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                    zIndex: 20,
                    overflow: "hidden",
                    padding: "6px",
                  }}
                >
                  {/* User info header */}
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      marginBottom: "4px",
                    }}
                  >
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>
                      {userName || "Admin"}
                    </p>
                    <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>
                      {userRole}
                    </p>
                  </div>

                  {[
                    { href: "/admin/configuracion", icon: <Settings style={{ width: "15px", height: "15px" }} />, label: "Configuración" },
                    { href: "/perfil",              icon: <User     style={{ width: "15px", height: "15px" }} />, label: "Mi Perfil" },
                  ].map(({ href, icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.55)",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "rgba(255,255,255,0.06)";
                        el.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.background = "transparent";
                        el.style.color = "rgba(255,255,255,0.55)";
                      }}
                    >
                      {icon}
                      {label}
                    </Link>
                  ))}

                  {/* Divider */}
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "6px 0" }} aria-hidden="true" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    role="menuitem"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      color: "#f87171",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.08)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <LogOut style={{ width: "15px", height: "15px" }} />
                    Cerrar Sesión
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
