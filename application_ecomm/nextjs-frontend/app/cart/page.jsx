import CartView from '@/components/CartView';
import { getCart } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  let cart = [];
  let total = 0;
  let error = null;

  try {
    const response = await getCart();
    if (response.success) {
      cart = response.data;
      total = response.total;
    } else {
      error = 'Impossible de charger le panier';
    }
  } catch (err) {
    error = `Erreur de connexion au Cart Service : ${err.message}`;
  }

  return (
    <>
      <h1 className="page-title">Mon Panier</h1>
      <p className="page-subtitle">Contenu récupéré en direct depuis le Cart Service</p>
      <CartView initialCart={cart} initialTotal={total} initialError={error} />
    </>
  );
}
