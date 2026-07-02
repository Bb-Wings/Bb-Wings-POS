/**
 * @fileoverview Auth Layout — BB Wings Management System
 * @description Layout para páginas de autenticación. Fondo oscuro con
 * gradiente animado y marca centrada.
 * @version 1.0.0
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: {
    template: "%s | BB Wings",
    default: "Autenticación | BB Wings",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — Decorativo (solo desktop) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#0d0d0d]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 80% at 30% 50%, rgba(214, 31, 44, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 60% at 70% 80%, rgba(244, 180, 0, 0.06) 0%, transparent 50%)
            `,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-2xl text-white tracking-wider">
              BB WINGS
            </span>
          </Link>

          {/* Middle content */}
          <div>
            <h2 className="font-display text-6xl text-white leading-none mb-4">
              EL SABOR
              <br />
              <span className="gradient-text-primary">QUE TE VUELA</span>
            </h2>
            <p className="text-gray-muted text-lg max-w-sm leading-relaxed">
              Únete a miles de clientes que disfrutan las mejores alitas de la
              ciudad con nuestro programa de puntos exclusivo.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { value: "50K+",  label: "Clientes" },
                { value: "4.9★", label: "Calificación" },
                { value: "15+",  label: "Sabores" },
              ].map((stat) => (
                <div key={stat.value} className="glass rounded-xl p-4 border border-white/5 text-center">
                  <p className="text-2xl font-bold font-heading text-white">{stat.value}</p>
                  <p className="text-xs text-gray-muted mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-muted">
            © {new Date().getFullYear()} BB Wings. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-dark relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl text-white tracking-wider">
              BB WINGS
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
