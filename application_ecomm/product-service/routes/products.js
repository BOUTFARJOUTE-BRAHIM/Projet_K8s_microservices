/**
 * =============================================================
 * Product Service - Routes des produits (PostgreSQL)
 * =============================================================
 * 
 * Ce fichier définit les routes REST pour le microservice Produit :
 * 
 *   GET /api/products        → Retourner la liste de tous les produits
 *   GET /api/products/:id    → Retourner le détail d'un produit par son ID
 * 
 * Les données proviennent de la base PostgreSQL (table "products")
 * via le pool de connexions défini dans db.js.
 */

const express = require('express');
const router = express.Router();

// Import du pool de connexions PostgreSQL
const pool = require('../db');

/**
 * GET /api/products
 * 
 * Retourne la liste complète des produits.
 * Supporte le filtrage optionnel par catégorie via query parameter.
 * 
 * @query {string} category - (Optionnel) Filtrer les produits par catégorie
 * 
 * @example
 *   GET /api/products              → Tous les produits
 *   GET /api/products?category=Audio  → Produits de la catégorie "Audio"
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let result;

    // Filtrage par catégorie si le paramètre est fourni
    if (category) {
      result = await pool.query(
        'SELECT * FROM products WHERE LOWER(category) = LOWER($1)',
        [category]
      );
    } else {
      result = await pool.query('SELECT * FROM products');
    }

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
      error: error.message
    });
  }
});

/**
 * GET /api/products/:id
 * 
 * Retourne le détail d'un produit spécifique par son ID.
 * 
 * @param {number} id - L'identifiant unique du produit
 * 
 * @example
 *   GET /api/products/1  → Détail du produit avec l'ID 1
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Vérification que l'ID est un nombre valide
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du produit doit être un nombre valide'
      });
    }

    // Recherche du produit par ID dans PostgreSQL
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    // Vérification que le produit existe
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Produit avec l'ID ${id} non trouvé`
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du produit',
      error: error.message
    });
  }
});

module.exports = router;
