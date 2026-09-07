import 'server-only';

/**
 * =============================================================
 * Configuration des URLs des microservices
 * =============================================================
 *
 * Le package "server-only" fait planter le build si ce fichier est
 * jamais importé depuis un composant client par erreur : ces URLs
 * (et donc la topologie interne du cluster) ne doivent jamais fuiter
 * vers le navigateur.
 */
export const SERVICES = {
  PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3001',
  CART: process.env.CART_SERVICE_URL || 'http://cart-service:3002',
  ORDER: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  USER: process.env.USER_SERVICE_URL || 'http://user-service:8001',
  REVIEW: process.env.REVIEW_SERVICE_URL || 'http://review-service:8002',
  ARTICLE: process.env.ARTICLE_SERVICE_URL || 'http://article-service:5001',
};
