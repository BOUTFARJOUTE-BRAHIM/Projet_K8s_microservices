'use client';

import { useState, useEffect, useTransition } from 'react';
import { createReviewAction, getProductReviewsAction } from '@/lib/actions';

export default function ProductReviewsModal({ product, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, startSubmitTransition] = useTransition();
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Form state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getProductReviewsAction(product.id);
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Erreur lors du chargement des avis :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!userName.trim() || !comment.trim()) {
      setFormError('Veuillez renseigner votre nom et votre commentaire.');
      return;
    }

    startSubmitTransition(async () => {
      try {
        const response = await createReviewAction({
          product_id: product.id,
          user_name: userName.trim(),
          rating: Number(rating),
          comment: comment.trim(),
        });

        if (response.success) {
          setFormSuccess('Merci ! Votre avis a été enregistré avec succès.');
          setComment('');
          fetchReviews();
        } else {
          setFormError(response.message || "Erreur lors de l'enregistrement de l'avis");
        }
      } catch (err) {
        setFormError(`Erreur : ${err.message}`);
      }
    });
  };

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">⭐ Avis clients : {product.name}</h2>
            <span className="modal-subtitle">{product.category} &middot; {parseFloat(product.price).toFixed(2)} €</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Section Statistiques */}
          {stats && (
            <div className="review-stats-card">
              <div className="review-stats-main">
                <div className="review-stats-score">{stats.average_rating}</div>
                <div className="review-stats-stars">
                  {'★'.repeat(Math.round(stats.average_rating))}
                  {'☆'.repeat(5 - Math.round(stats.average_rating))}
                </div>
                <div className="review-stats-count">{stats.total_reviews} avis au total</div>
              </div>

              <div className="review-stats-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.rating_distribution?.[String(star)] || 0;
                  const percent = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                  return (
                    <div key={star} className="rating-bar-row">
                      <span className="rating-bar-label">{star} ★</span>
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="rating-bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Formulaire pour ajouter un avis */}
          <div className="review-form-section">
            <h3 className="section-subtitle">✍️ Donner votre avis</h3>
            {formSuccess && <div className="success-banner">{formSuccess}</div>}
            {formError && <div className="error-banner">{formError}</div>}

            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group-inline">
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="user_name">Votre nom ou pseudo</label>
                  <input
                    id="user_name"
                    type="text"
                    className="form-input"
                    placeholder="Ex: Sarah, Brahim..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="rating">Note</label>
                  <select
                    id="rating"
                    className="form-input"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Votre commentaire</label>
                <textarea
                  id="comment"
                  className="form-textarea"
                  rows="3"
                  placeholder="Partagez votre expérience avec ce produit..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Envoi en cours...' : 'Publier mon avis'}
              </button>
            </form>
          </div>

          {/* Liste des avis existants */}
          <div className="review-list-section">
            <h3 className="section-subtitle">💬 Commentaires récents</h3>
            {loading ? (
              <div className="loading-state">Chargement des avis...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-reviews">Aucun avis pour ce produit pour le moment. Soyez le premier à donner votre avis !</div>
            ) : (
              <div className="reviews-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-item-card">
                    <div className="review-item-header">
                      <div className="review-item-user">
                        <span className="review-avatar">{rev.user_name.charAt(0).toUpperCase()}</span>
                        <strong>{rev.user_name}</strong>
                      </div>
                      <span className="review-item-stars">
                        {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <p className="review-item-comment">{rev.comment}</p>
                    <span className="review-item-date">
                      {new Date(rev.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
