/**
 * =============================================================
 * Order Service - Routes des commandes (PostgreSQL)
 * =============================================================
 * 
 * Routes REST pour la gestion des commandes :
 * 
 *   GET  /api/orders      → Consulter toutes les commandes
 *   GET  /api/orders/:id  → Consulter une commande spécifique
 *   POST /api/orders      → Créer une nouvelle commande
 * 
 * Communication inter-services :
 *   Ce service communique avec le Product Service via son nom DNS
 *   Kubernetes (http://product-service:3001) pour vérifier que les
 *   produits existent avant de créer une commande.
 * 
 * Les données sont stockées dans les tables "orders" et "order_items"
 * de PostgreSQL via le pool de connexions défini dans db.js.
 */

const express = require('express');
const router = express.Router();

// Import du pool de connexions PostgreSQL
const pool = require('../db');

// URL du Product Service via le nom DNS Kubernetes
// En local, on peut surcharger via la variable d'environnement PRODUCT_SERVICE_URL
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-srv:3001';

/**
 * GET /api/orders
 * 
 * Retourne la liste de toutes les commandes avec leurs articles.
 */
router.get('/', async (req, res) => {
  try {
    // Récupérer toutes les commandes
    const ordersResult = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    // Pour chaque commande, récupérer ses articles
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );

        return {
          id: order.id,
          items: itemsResult.rows.map((item) => ({
            productId: item.product_id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity
          })),
          total: parseFloat(order.total),
          status: order.status,
          createdAt: order.created_at.toISOString()
        };
      })
    );

    res.status(200).json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des commandes',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/:id
 * 
 * Retourne le détail d'une commande spécifique par son ID.
 * 
 * @param {number} id - L'identifiant de la commande
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID de la commande doit être un nombre valide'
      });
    }

    // Recherche de la commande
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Commande avec l'ID ${id} non trouvée`
      });
    }

    const order = orderResult.rows[0];

    // Récupérer les articles de la commande
    const itemsResult = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        items: itemsResult.rows.map((item) => ({
          productId: item.product_id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity
        })),
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la commande',
      error: error.message
    });
  }
});

/**
 * POST /api/orders
 * 
 * Crée une nouvelle commande.
 * Vérifie chaque produit auprès du Product Service via API REST
 * avant de valider la commande.
 * 
 * @body {Array} items - Liste des articles : [{ productId, quantity }]
 */
router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    // Validation : la commande doit contenir au moins un article
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La commande doit contenir au moins un article (items)'
      });
    }

    // -------------------------------------------------------
    // Vérification des produits auprès du Product Service
    // Communication inter-services via API REST
    // -------------------------------------------------------
    const verifiedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Chaque article doit avoir un productId et une quantity'
        });
      }

      try {
        // Appel REST vers le Product Service pour vérifier le produit
        const response = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        const productData = await response.json();

        if (!productData.success) {
          return res.status(404).json({
            success: false,
            message: `Produit avec l'ID ${item.productId} non trouvé dans le catalogue`
          });
        }

        // Ajouter l'article vérifié avec les données du Product Service
        verifiedItems.push({
          productId: productData.data.id,
          name: productData.data.name,
          price: productData.data.price,
          quantity: item.quantity
        });
      } catch (fetchError) {
        return res.status(503).json({
          success: false,
          message: `Impossible de contacter le Product Service pour vérifier le produit ${item.productId}`,
          error: fetchError.message
        });
      }
    }

    // -------------------------------------------------------
    // Création de la commande dans PostgreSQL (transaction)
    // -------------------------------------------------------
    const total = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insérer la commande
      const orderResult = await client.query(
        'INSERT INTO orders (total, status) VALUES ($1, $2) RETURNING *',
        [parseFloat(total.toFixed(2)), 'pending']
      );
      const newOrder = orderResult.rows[0];

      // Insérer les articles de la commande
      for (const item of verifiedItems) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
          [newOrder.id, item.productId, item.name, item.price, item.quantity]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès',
        data: {
          id: newOrder.id,
          items: verifiedItems,
          total: parseFloat(newOrder.total),
          status: newOrder.status,
          createdAt: newOrder.created_at.toISOString()
        }
      });
    } catch (txError) {
      await client.query('ROLLBACK');
      throw txError;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la commande',
      error: error.message
    });
  }
});

module.exports = router;
