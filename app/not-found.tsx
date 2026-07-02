/**
 * @fileoverview Not Found — BB Wings Management System
 */

import Link from "next/link";
import { Flame } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center max-w-md px-6">
        <Flame className="h-20 w-20 text-primary mx-auto mb-6 opacity-50" aria-hidden="true" />
        <h1 className="font-display text-8xl text-primary mb-4">404</h1>
        <h2 className="font-heading text-2xl text-white mb-3">Página no encontrada</h2>
        <p className="text-gray-muted mb-8">
          Parece que esta página voló tan alto como el sabor de nuestras alitas.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold font-ui hover:bg-primary-600 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
