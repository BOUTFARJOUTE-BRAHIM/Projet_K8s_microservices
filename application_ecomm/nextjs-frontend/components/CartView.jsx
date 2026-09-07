'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeFromCartAction, createOrderAction } from '@/lib/actions';

/**
 * CartView - Client Component
 *
 * Le panier est chargé côté serveur par app/cart/page.jsx. Ce composant
 * gère uniquement les interactions : suppression d'un article et
 * validation de la commande, toutes deux déléguées à des Server Actions.
 * Après chaque mutation, router.refresh() redemande au serveur de
 * ré-exécuter la page (donc de refaire le fetch vers Cart Service).
 */
export default function CartView({ initialCart, initialTotal, initialError }) {
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState(initialError);
  const [ordering, startOrderTransition] = useTransition();
  const [removing, startRemoveTransition] = useTransition();
  const router = useRouter();

  const handleRemove = (productId) => {
    startRemoveTransition(async () => {
      try {
        const response = await removeFromCartAction(productId);
        if (response.success) {
          router.refresh();
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    });
  };

  const handleOrder = () => {
    startOrderTransition(async () => {
      try {
        setError(null);
        const items = initialCart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));

        const response = await createOrderAction(items);

        if (response.success) {
          setOrderSuccess(response.data);
        } else {
          setError(response.message || 'Erreur lors de la création de la commande');
        }
      } catch (err) {
        setError(`Erreur de connexion au Order Service : ${err.message}`);
      }
    });
  };

  if (orderSuccess) {
    return (
      <div className="cart-container">
        <div className="order-success">
          <h2>🎉 Commande #{orderSuccess.id} créée avec succès !</h2>
          <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
            Total : <strong>{parseFloat(orderSuccess.total).toFixed(2)} €</strong> — Statut :{' '}
            <strong>{orderSuccess.status}</strong>
          </p>
          <Link
            href="/orders"
            className="btn-order"
            style={{ maxWidth: '300px', margin: '1.5rem auto 0', display: 'flex' }}
          >
            📋 Voir mes commandes
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>⚠️ {error}</p>
        <button
          className="btn-add-cart"
          style={{ maxWidth: '200px', margin: '1rem auto 0' }}
          onClick={() => router.refresh()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (initialCart.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🛒</div>
        <p>Votre panier est vide</p>
        <Link
          href="/"
          className="btn-add-cart"
          style={{ maxWidth: '250px', margin: '1rem auto 0', display: 'flex' }}
        >
          Parcourir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {initialCart.map((item) => (
        <div className="cart-item" key={item.productId}>
          <div className="cart-item__info">
            <h3 className="cart-item__name">{item.name}</h3>
            <div className="cart-item__details">
              <span className="cart-item__price">{parseFloat(item.price).toFixed(2)} €</span>
              <span className="cart-item__quantity">× {item.quantity}</span>
            </div>
          </div>
          <span className="cart-item__subtotal">
            {(parseFloat(item.price) * item.quantity).toFixed(2)} €
          </span>
          <button className="btn-remove" onClick={() => handleRemove(item.productId)} disabled={removing}>
            ✕ Supprimer
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <div className="cart-summary__row">
          <span className="cart-summary__label">Articles</span>
          <span className="cart-summary__value">{initialCart.length}</span>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <span className="cart-summary__label cart-summary__label--total">Total</span>
          <span className="cart-summary__value cart-summary__value--total">
            {parseFloat(initialTotal).toFixed(2)} €
          </span>
        </div>
      </div>

      <button className="btn-order" onClick={handleOrder} disabled={ordering}>
        {ordering ? '⏳ Commande en cours...' : '🚀 Passer la commande'}
      </button>
    </div>
  );
}
