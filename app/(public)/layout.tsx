/**
 * @fileoverview Public Layout — BB Wings Management System
 * @description Layout para rutas públicas. No incluye Navbar ni Footer
 * propios (cada página los maneja) pero provee estructura base.
 */

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
