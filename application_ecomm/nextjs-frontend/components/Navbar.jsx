'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navbar - Client Component
 *
 * Doit être un Client Component uniquement parce qu'elle a besoin de
 * usePathname() pour surligner le lien actif. Le compteur du panier,
 * lui, est calculé côté serveur (dans app/layout.jsx) et simplement
 * reçu ici en props : aucune requête réseau n'est faite depuis le
 * navigateur.
 */
export default function Navbar({ cartCount = 0 }) {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Produits' },
    { href: '/articles', label: 'Articles' },
    { href: '/users', label: 'Utilisateurs' },
    { href: '/cart', label: 'Panier', badge: cartCount },
    { href: '/orders', label: 'Mes commandes' },
  ];

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link href="/" className="navbar__logo">
          <span className="navbar__logo-icon">🛍️</span>
          E-Shop Microservices
        </Link>

        <nav className="navbar__nav">
          {links.map((link) => {
            const isActive =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar__link ${link.badge !== undefined ? 'navbar__link--cart' : ''} ${
                  isActive ? 'navbar__link--active' : ''
                }`}
              >
                {link.label}
                {!!link.badge && <span className="navbar__badge">{link.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
