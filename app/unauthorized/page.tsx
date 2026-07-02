/**
 * @fileoverview Unauthorized Page — BB Wings Management System
 */

import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center max-w-md px-6">
        <ShieldOff className="h-20 w-20 text-danger mx-auto mb-6 opacity-60" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-bold text-white mb-3">
          Acceso no autorizado
        </h1>
        <p className="text-gray-muted mb-8">
          No tienes permisos para acceder a esta sección. Contacta con un administrador si crees que es un error.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold font-ui hover:bg-primary-600 transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white font-semibold font-ui hover:bg-white/5 transition-colors"
          >
            Cambiar cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
