import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/lib/api';

// Toujours refaire le fetch côté serveur à chaque requête (stock temps réel)
export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  let products = [];
  let error = null;

  try {
    const response = await getProducts();
    if (response.success) {
      products = response.data;
    } else {
      error = 'Impossible de charger les produits';
    }
  } catch (err) {
    error = `Erreur de connexion au Product Service : ${err.message}`;
  }

  return (
    <>
      <h1 className="page-title">Nos Produits</h1>
      <p className="page-subtitle">Découvrez notre catalogue tech, servi directement par le Product Service</p>
      <ProductGrid initialProducts={products} initialError={error} />
    </>
  );
}
