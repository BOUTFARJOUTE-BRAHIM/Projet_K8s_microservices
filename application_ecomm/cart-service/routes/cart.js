/**
 * =============================================================
 * Cart Service - Routes du panier (PostgreSQL)
 * =============================================================
 * 
 * Routes REST pour la gestion du panier :
 * 
 *   GET    /api/cart            → Afficher le contenu du panier
 *   POST   /api/cart            → Ajouter un produit au panier
 *   DELETE /api/cart/:productId → Supprimer un produit du panier
 * 
 * Les données sont stockées dans la table "cart_items" de PostgreSQL
 * via le pool de connexions défini dans db.js.
 */

const express = require('express');
const router = express.Router();

// Import du pool de connexions PostgreSQL
const pool = require('../db');

/**
 * GET /api/cart
 * 
 * Retourne le contenu complet du panier avec le total.
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cart_items');
    const cartItems = result.rows;

    // Calcul du prix total du panier
    const total = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      count: cartItems.length,
      total: parseFloat(total.toFixed(2)),
      data: cartItems.map((item) => ({
        productId: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du panier',
      error: error.message
    });
  }
});

/**
 * POST /api/cart
 * 
 * Ajoute un produit au panier.
 * Si le produit existe déjà dans le panier, la quantité est incrémentée.
 * 
 * @body {number} productId - L'ID du produit à ajouter
 * @body {string} name      - Le nom du produit
 * @body {number} price     - Le prix unitaire du produit
 * @body {number} quantity  - La quantité à ajouter (par défaut 1)
 */
router.post('/', async (req, res) => {
  try {
    const { productId, name, price, quantity = 1 } = req.body;

    // Validation des champs obligatoires
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Les champs productId, name et price sont obligatoires'
      });
    }

    // Vérifier si le produit existe déjà dans le panier
    const existing = await pool.query(
      'SELECT * FROM cart_items WHERE product_id = $1',
      [productId]
    );

    if (existing.rows.length > 0) {
      // Si le produit existe, incrémenter la quantité
      const newQuantity = existing.rows[0].quantity + quantity;
      const updated = await pool.query(
        'UPDATE cart_items SET quantity = $1 WHERE product_id = $2 RETURNING *',
        [newQuantity, productId]
      );

      const item = updated.rows[0];
      return res.status(200).json({
        success: true,
        message: `Quantité du produit "${name}" mise à jour dans le panier`,
        data: {
          productId: item.product_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity
        }
      });
    }

    // Sinon, ajouter le nouveau produit au panier
    const inserted = await pool.query(
      'INSERT INTO cart_items (product_id, name, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [productId, name, price, quantity]
    );

    const newItem = inserted.rows[0];
    res.status(201).json({
      success: true,
      message: `Produit "${name}" ajouté au panier`,
      data: {
        productId: newItem.product_id,
        name: newItem.name,
        price: parseFloat(newItem.price),
        quantity: newItem.quantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout au panier',
      error: error.message
    });
  }
});

/**
 * DELETE /api/cart/:productId
 * 
 * Supprime un produit du panier par son productId.
 * 
 * @param {number} productId - L'ID du produit à supprimer
 */
router.delete('/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    // Vérification que l'ID est un nombre valide
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du produit doit être un nombre valide'
      });
    }

    // Suppression du produit du panier avec RETURNING pour récupérer les données
    const result = await pool.query(
      'DELETE FROM cart_items WHERE product_id = $1 RETURNING *',
      [productId]
    );

    // Vérification que le produit était dans le panier
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Produit avec l'ID ${productId} non trouvé dans le panier`
      });
    }

    const removedItem = result.rows[0];
    res.status(200).json({
      success: true,
      message: `Produit "${removedItem.name}" supprimé du panier`,
      data: {
        productId: removedItem.product_id,
        name: removedItem.name,
        price: parseFloat(removedItem.price),
        quantity: removedItem.quantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du produit du panier',
      error: error.message
    });
  }
});

module.exports = router;
