'use client'
/**
 * @fileoverview Navbar Component — BB Wings Management System
 * @description Barra de navegación principal. Transparente en scroll arriba,
 * glassmorphism al hacer scroll. Incluye menú móvil, carrito y usuario.
 * @version 1.0.0
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChefHat,
  ClipboardList,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated, useCurrentUser, useIsAdmin } from "@/lib/store/auth.store";
import { useCartTotalItems, useCartStore } from "@/lib/store/cart.store";
import { logoutAction } from "@/lib/actions/auth.actions";
import { cn } from "@/lib/utils/cn";

// ─── Navigation Links ──────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/menu",       label: "Menú" },
  { href: "/promotions", label: "Promociones" },
  { href: "/reservas",   label: "Reservaciones" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();
  const isAdmin = useIsAdmin();
  const totalItems = useCartTotalItems();
  const openCart = useCartStore((state) => state.openCart);

  // ── Scroll detection ────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { window.removeEventListener("scroll", handleScroll); };
  }, []);

  // ── Close mobile menu on route change ───────────────────────────────────
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logoutAction();
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1030] transition-all duration-350",
          isScrolled || isMobileOpen
            ? "glass-strong border-b border-white/5 shadow-glass"
            : "bg-transparent"
        )}
      >
        <nav
          className="container-app"
          aria-label="Navegación principal"
        >
          <div className="flex items-center justify-between h-[var(--nav-height)]">
            {/* ── Logo ──────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              aria-label="BB Wings — Inicio"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary group-hover:shadow-glow-primary transition-shadow duration-300">
                <Flame className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-display text-2xl text-white tracking-wider">
                BB WINGS
              </span>
            </Link>

            {/* ── Desktop Navigation ─────────────────────────────────── */}
            <ul className="hidden md:flex items-center gap-1" role="list">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium font-ui transition-all duration-200",
                      pathname === href || pathname.startsWith(href)
                        ? "text-white bg-white/10"
                        : "text-gray-muted hover:text-white hover:bg-white/5"
                    )}
                    aria-current={pathname === href ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ── Right Actions ─────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* Cart button */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg text-gray-muted hover:text-white hover:bg-white/5 transition-all duration-200"
                aria-label={`Carrito de compras. ${totalItems} productos`}
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="badge-count"
                    aria-hidden="true"
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Auth section */}
              {isAuthenticated && user !== null ? (
                <div style={{ position: "relative" }} className="hidden md:block">
                  <button
                    onClick={() => { setIsUserMenuOpen((prev) => !prev); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "rgba(255,255,255,0.08)";
                      el.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.background = "rgba(255,255,255,0.04)";
                      el.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                    id="user-menu-button"
                  >
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(234,88,12,0.3), rgba(214,31,44,0.2))",
                      border: "1px solid rgba(234,88,12,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#f97316" }}>
                        {user.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.nombre}
                    </span>
                  </button>

                  {/* User dropdown */}
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
                          aria-labelledby="user-menu-button"
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
                            zIndex: 1040,
                            overflow: "hidden",
                            padding: "6px",
                          }}
                        >
                          <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
                            <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", fontWeight: 550, textTransform: "uppercase", letterSpacing: "0.02em" }}>Conectado como</p>
                            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {user.nombre} {user.apellido}
                            </p>
                          </div>

                          {[
                            { href: "/perfil", icon: <User style={{ width: "14px", height: "14px" }} />, label: "Mi Perfil" },
                            { href: "/pedidos", icon: <ClipboardList style={{ width: "14px", height: "14px" }} />, label: "Mis Pedidos" },
                            ...(isAdmin ? [{ href: "/admin/dashboard", icon: <LayoutDashboard style={{ width: "14px", height: "14px" }} />, label: "Panel Admin" }] : []),
                            ...(user.rol === "cajero" ? [{ href: "/pos", icon: <ChefHat style={{ width: "14px", height: "14px" }} />, label: "POS" }] : []),
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

                          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />

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
                            <LogOut style={{ width: "14px", height: "14px" }} />
                            Cerrar Sesión
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { router.push("/login"); }}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => { router.push("/register"); }}
                  >
                    Registrarse
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-muted hover:text-white hover:bg-white/5 transition-all"
                onClick={() => { setIsMobileOpen((prev) => !prev); }}
                aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Mobile Menu ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <nav className="container-app py-4 space-y-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-medium font-ui transition-all",
                      pathname === href
                        ? "text-white bg-white/10"
                        : "text-gray-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    {label}
                  </Link>
                ))}

                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => { router.push("/login"); }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => { router.push("/register"); }}
                    >
                      Registrarse
                    </Button>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-white/5 space-y-1">
                    <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-muted hover:text-white rounded-xl hover:bg-white/5 transition-all">
                      <User className="h-4 w-4" /> Mi Perfil
                    </Link>
                    <Link href="/pedidos" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-muted hover:text-white rounded-xl hover:bg-white/5 transition-all">
                      <ClipboardList className="h-4 w-4" /> Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-danger hover:bg-danger/10 rounded-xl transition-all"
                    >
                      <LogOut className="h-4 w-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-[var(--nav-height)]" aria-hidden="true" />
    </>
  );
}
