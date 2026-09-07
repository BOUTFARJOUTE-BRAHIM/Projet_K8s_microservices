import 'server-only';
import { SERVICES } from './config';

/**
 * =============================================================
 * Couche d'accès aux microservices - 100% côté serveur
 * =============================================================
 *
 * Ces fonctions ne sont appelées que depuis :
 *   - des Server Components (app/**\/page.jsx)
 *   - des Server Actions (lib/actions.js)
 *
 * Le navigateur n'exécute jamais ce code et ne connaît jamais les URLs
 * des microservices : c'est le serveur Next.js qui joue le rôle de
 * client HTTP vis-à-vis de product-service / cart-service / order-service,
 * exactement comme order-service le fait déjà vis-à-vis de product-service.
 *
 * `cache: 'no-store'` force un fetch dynamique à chaque requête : les
 * données (stock, panier, commandes) doivent toujours être fraîches.
 */

async function safeJson(response) {
  if (!response.ok && response.status !== 400 && response.status !== 404) {
    throw new Error(`Le service a répondu avec le statut ${response.status}`);
  }
  return response.json();
}

// =============================================================
// Product Service
// =============================================================

export async function getProducts(category = '') {
  const url = category
    ? `${SERVICES.PRODUCT}/api/products?category=${encodeURIComponent(category)}`
    : `${SERVICES.PRODUCT}/api/products`;

  const response = await fetch(url, { cache: 'no-store' });
  return safeJson(response);
}

export async function getProductById(id) {
  const response = await fetch(`${SERVICES.PRODUCT}/api/products/${id}`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

// =============================================================
// Cart Service
// =============================================================

export async function getCart() {
  const response = await fetch(`${SERVICES.CART}/api/cart`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function addToCart(product) {
  const response = await fetch(`${SERVICES.CART}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function removeFromCart(productId) {
  const response = await fetch(`${SERVICES.CART}/api/cart/${productId}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  return safeJson(response);
}

// =============================================================
// Order Service
// =============================================================

export async function createOrder(items) {
  const response = await fetch(`${SERVICES.ORDER}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function getOrders() {
  const response = await fetch(`${SERVICES.ORDER}/api/orders`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

// =============================================================
// User Service (Django)
// =============================================================

export async function getUsers() {
  const response = await fetch(`${SERVICES.USER}/api/users/`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function getUserById(id) {
  const response = await fetch(`${SERVICES.USER}/api/users/${id}/`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function createUser(userData) {
  const response = await fetch(`${SERVICES.USER}/api/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
    cache: 'no-store',
  });
  return safeJson(response);
}

// =============================================================
// Review Service (Django)
// =============================================================

export async function getProductReviews(productId) {
  const url = productId
    ? `${SERVICES.REVIEW}/api/reviews/?product_id=${productId}`
    : `${SERVICES.REVIEW}/api/reviews/`;
  const response = await fetch(url, { cache: 'no-store' });
  return safeJson(response);
}

export async function getProductReviewStats(productId) {
  const response = await fetch(`${SERVICES.REVIEW}/api/reviews/product/${productId}/stats/`, {
    cache: 'no-store',
  });
  return safeJson(response);
}

export async function createReview(reviewData) {
  const response = await fetch(`${SERVICES.REVIEW}/api/reviews/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
    cache: 'no-store',
  });
  return safeJson(response);
}

// =============================================================
// Article Service (Flask)
// =============================================================

export async function getArticles(category = '') {
  const url = category
    ? `${SERVICES.ARTICLE}/api/articles?category=${encodeURIComponent(category)}`
    : `${SERVICES.ARTICLE}/api/articles`;
  const response = await fetch(url, { cache: 'no-store' });
  return safeJson(response);
}

export async function getArticleById(id) {
  const response = await fetch(`${SERVICES.ARTICLE}/api/articles/${id}`, {
    cache: 'no-store',
  });
  return safeJson(response);
}
