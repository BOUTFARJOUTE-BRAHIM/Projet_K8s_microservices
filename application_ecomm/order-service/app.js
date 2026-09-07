/**
 * =============================================================
 * Order Service - Application Express (sans écoute réseau)
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
    service: 'order-service',
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Routes des commandes
const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée sur le Order Service`
  });
});

module.exports = app;
