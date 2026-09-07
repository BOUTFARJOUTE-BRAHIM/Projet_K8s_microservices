/**
 * =============================================================
 * Order Service - Données des commandes en mémoire
 * =============================================================
 * 
 * Structure d'une commande :
 * {
 *   id: number,
 *   items: [{ productId, name, price, quantity }],
 *   total: number,
 *   status: string ("pending" | "confirmed" | "shipped" | "delivered"),
 *   createdAt: string (ISO date)
 * }
 */

const orders = [];

// Compteur auto-incrémenté pour les IDs de commande
let nextOrderId = 1;

module.exports = { orders, getNextOrderId: () => nextOrderId++ };
