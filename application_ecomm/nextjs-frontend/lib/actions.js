'use server';

import { revalidatePath } from 'next/cache';
import {
  addToCart,
  removeFromCart,
  createOrder,
  createUser,
  createReview,
  getProductReviews,
  getProductReviewStats,
} from './api';

/**
 * =============================================================
 * Server Actions
 * =============================================================
 *
 * Ces fonctions s'exécutent EXCLUSIVEMENT sur le serveur Next.js, même
 * si elles sont importées et appelées depuis des composants clients
 * (Next.js génère automatiquement le point d'entrée RPC nécessaire).
 */

export async function addToCartAction(product) {
  const result = await addToCart(product);
  revalidatePath('/', 'layout');
  return result;
}

export async function removeFromCartAction(productId) {
  const result = await removeFromCart(productId);
  revalidatePath('/', 'layout');
  return result;
}

export async function createOrderAction(items) {
  const result = await createOrder(items);
  revalidatePath('/', 'layout');
  return result;
}

export async function createUserAction(userData) {
  const result = await createUser(userData);
  revalidatePath('/users');
  return result;
}

export async function createReviewAction(reviewData) {
  const result = await createReview(reviewData);
  revalidatePath('/', 'layout');
  return result;
}

export async function getProductReviewsAction(productId) {
  const [reviewsRes, statsRes] = await Promise.all([
    getProductReviews(productId).catch(() => ({ success: false, data: [] })),
    getProductReviewStats(productId).catch(() => ({ success: false, data: null })),
  ]);

  return {
    reviews: reviewsRes?.data || [],
    stats: statsRes?.data || null,
  };
}
