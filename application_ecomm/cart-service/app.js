/**
 * =============================================================
 * Cart Service - Application Express (sans écoute réseau)
 * =============================================================
 *
 * Exporte uniquement l'app Express configurée (pas de app.listen),
 * pour être réutilisée par server.js et par les tests Supertest.
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
    service: 'cart-service',
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Routes du panier
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée sur le Cart Service`
  });
});

module.exports = app;
