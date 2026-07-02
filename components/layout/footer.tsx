/**
 * @fileoverview Footer — BB Wings Management System
 * @description Pie de página con links, redes sociales, información legal y newsletter.
 * @version 1.0.0
 */

import Link from "next/link";
import {
  Flame,
  MapPin,
  Phone,
  Clock,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  menu: {
    title: "Menú",
    links: [
      { href: "/menu",        label: "Todas las Alitas" },
      { href: "/menu#combos", label: "Combos" },
      { href: "/menu#extras", label: "Extras" },
      { href: "/promotions",  label: "Promociones" },
    ],
  },
  cuenta: {
    title: "Mi Cuenta",
    links: [
      { href: "/login",     label: "Iniciar Sesión" },
      { href: "/register",  label: "Registrarse" },
      { href: "/pedidos",   label: "Mis Pedidos" },
      { href: "/favoritos", label: "Favoritos" },
    ],
  },
  empresa: {
    title: "Empresa",
    links: [
      { href: "/nosotros",  label: "Nosotros" },
      { href: "/careers",   label: "Trabaja con Nosotros" },
      { href: "/franchise", label: "Franquicias" },
      { href: "/press",     label: "Prensa" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { href: "/privacy",  label: "Privacidad" },
      { href: "/terms",    label: "Términos de Uso" },
      { href: "/cookies",  label: "Cookies" },
    ],
  },
} as const;

// Custom Brand Icons (since Lucide v1 removed all brand logos)
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const SOCIAL_LINKS = [
  { href: "https://instagram.com/bbwings", icon: <InstagramIcon className="h-5 w-5" />, label: "Instagram" },
  { href: "https://facebook.com/bbwings",  icon: <FacebookIcon className="h-5 w-5" />,  label: "Facebook" },
  { href: "https://twitter.com/bbwings",   icon: <TwitterIcon className="h-5 w-5" />,   label: "Twitter X" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5" role="contentinfo">
      <div className="container-app py-16">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4" aria-label="BB Wings — Inicio">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20 border border-primary/20">
                <Flame className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-display text-2xl text-white tracking-wider">
                BB WINGS
              </span>
            </Link>
            <p className="text-sm text-gray-muted leading-relaxed mb-6 max-w-xs">
              Las mejores alitas de la ciudad. Más de 15 sabores únicos preparados
              con ingredientes frescos y mucho amor.
            </p>

            {/* Social */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Síguenos en ${label}`}
                  className="flex items-center justify-center h-9 w-9 rounded-xl glass border border-white/10 text-gray-muted hover:text-white hover:border-primary/30 hover:bg-primary/10 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          {Object.entries(FOOTER_LINKS).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold text-white font-ui mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5" role="list">
                {section.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-muted hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact & Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pt-10 border-t border-white/5">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Sucursal Principal</p>
              <p className="text-sm text-gray-muted">Av. Insurgentes Sur 1234<br />Col. Del Valle, CDMX</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Teléfono</p>
              <a href="tel:+525512345678" className="text-sm text-gray-muted hover:text-white transition-colors">
                +52 55 1234 5678
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-white mb-1">Horario</p>
              <p className="text-sm text-gray-muted">
                Lun–Jue: 1pm – 11pm<br />
                Vie–Dom: 12pm – 1am
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
          <p className="text-xs text-gray-muted text-center md:text-left">
            © {currentYear} BB Wings. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-muted">
            Hecho con 🔥 en México
          </p>
        </div>
      </div>
    </footer>
  );
}
