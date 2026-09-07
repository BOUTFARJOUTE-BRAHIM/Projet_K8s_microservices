'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addToCartAction } from '@/lib/actions';
import ProductReviewsModal from './ProductReviewsModal';

/**
 * ProductGrid - Client Component
 *
 * Reçoit les produits déjà chargés côté serveur.
 * Permet l'ajout au panier et la consultation/soumission d'avis
 * via le microservice Review Service.
 */
export default function ProductGrid({ initialProducts, initialError }) {
  const [addedProducts, setAddedProducts] = useState(new Set());
  const [selectedProductForReviews, setSelectedProductForReviews] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const categoryEmojis = {
    Ordinateurs: '💻',
    Smartphones: '📱',
    Audio: '🎧',
    Tablettes: '📟',
    Accessoires: '🖱️',
    Écrans: '🖥️',
  };

  const getStockInfo = (stock) => {
    if (stock === 0) return { text: 'Rupture de stock', className: 'product-card__stock--out' };
    if (stock <= 10) return { text: `Plus que ${stock} en stock`, className: 'product-card__stock--low' };
    return { text: `${stock} en stock`, className: '' };
  };

  const handleAddToCart = (product) => {
    startTransition(async () => {
      try {
        const response = await addToCartAction({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });

        if (response.success) {
          setAddedProducts((prev) => new Set(prev).add(product.id));
          setTimeout(() => {
            setAddedProducts((prev) => {
              const next = new Set(prev);
              next.delete(product.id);
              return next;
            });
          }, 1500);
        }
      } catch (err) {
        console.error("Erreur lors de l'ajout au panier:", err);
      }
    });
  };

  if (initialError) {
    return (
      <div className="error-message">
        <p>⚠️ {initialError}</p>
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

  if (initialProducts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📦</div>
        <p>Aucun produit disponible</p>
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {initialProducts.map((product) => {
          const stockInfo = getStockInfo(product.stock);
          const isAdded = addedProducts.has(product.id);

          return (
            <article className="product-card" key={product.id}>
              <div className="product-card__image-container">
                <span className="product-card__emoji">
                  {categoryEmojis[product.category] || '📦'}
                </span>
                <span className="product-card__category">{product.category}</span>
              </div>

              <div className="product-card__body">
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__description">{product.description}</p>

                <div className="product-card__footer">
                  <span className="product-card__price">{parseFloat(product.price).toFixed(2)} €</span>
                  <button
                    type="button"
                    className="product-card__reviews-btn"
                    onClick={() => setSelectedProductForReviews(product)}
                    title="Consulter et donner des avis"
                  >
                    ⭐ {product.rating} <span className="reviews-link-hint">(Avis)</span>
                  </button>
                </div>

                <span className={`product-card__stock ${stockInfo.className}`}>
                  {stockInfo.text}
                </span>

                <div className="product-card__actions">
                  <button
                    className={`btn-add-cart ${isAdded ? 'btn-add-cart--added' : ''}`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || isPending}
                  >
                    {isAdded ? '✓ Ajouté !' : '🛒 Ajouter au panier'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedProductForReviews && (
        <ProductReviewsModal
          product={selectedProductForReviews}
          onClose={() => setSelectedProductForReviews(null)}
        />
      )}
    </>
  );
}
