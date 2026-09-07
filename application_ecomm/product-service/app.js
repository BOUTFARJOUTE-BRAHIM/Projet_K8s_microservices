/**
 * =============================================================
 * Product Service - Application Express (sans écoute réseau)
 * =============================================================
 *
 * Ce module exporte uniquement l'app Express configurée, sans
 * appeler app.listen(). Cela permet de la réutiliser telle quelle
 * dans server.js (démarrage réel) et dans les tests (Supertest),
 * sans ouvrir de port ni dépendre du réseau.
 */

const express = require('express');
const cors = require('cors');

const app = express();

// =============================================================
// Middlewares
// =============================================================

app.use(cors());
app.use(express.json());

// =============================================================
// Routes
// =============================================================

// Health Check - utilisé par Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'product-service',
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Routes des produits
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée sur le Product Service`
  });
});

module.exports = app;
