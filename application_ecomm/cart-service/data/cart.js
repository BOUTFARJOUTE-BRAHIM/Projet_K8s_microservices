/**
 * =============================================================
 * Cart Service - Données du panier en mémoire
 * =============================================================
 * 
 * Structure du panier : un tableau d'objets, chaque objet représente
 * un article dans le panier avec les informations du produit et la quantité.
 * 
 * Format d'un article du panier :
 * {
 *   productId: number,
 *   name: string,
 *   price: number,
 *   quantity: number
 * }
 */

const cart = [];

module.exports = cart;
