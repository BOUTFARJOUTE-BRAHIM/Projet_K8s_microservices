import './globals.css';
import Navbar from '@/components/Navbar';
import { getCart } from '@/lib/api';

export const metadata = {
  title: 'E-Shop Microservices',
  description: 'E-commerce Microservices - Boutique en ligne avec architecture microservices (Next.js SSR)',
};

// Le layout dépend du panier (dynamique) : on force le rendu dynamique
// pour toute l'application plutôt que de laisser Next.js essayer de
// pré-rendre statiquement des pages qui appellent des microservices.
export const dynamic = 'force-dynamic';

async function fetchCartCount() {
  try {
    const cart = await getCart();
    return cart?.data?.length ?? 0;
  } catch (error) {
    // Le Cart Service peut être indisponible : on dégrade proprement
    // plutôt que de faire planter tout le layout.
    return 0;
  }
}

export default async function RootLayout({ children }) {
  const cartCount = await fetchCartCount();

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app">
          <Navbar cartCount={cartCount} />
          <main className="main-content">{children}</main>
          <footer className="footer">
            E-Shop Microservices &middot; propulsé par{' '}
            <span className="footer__highlight">Next.js (Server-Side Rendering)</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
