/**
 * =============================================================
 * Product Service - Point d'entrée du microservice
 * =============================================================
 *
 * Microservice responsable de la gestion des produits.
 *
 * Fonctionnalités :
 *   - Liste des produits (avec filtre par catégorie)
 *   - Détail d'un produit par ID
 *
 * Port par défaut : 3001
 *
 * Ce microservice est conçu pour être déployé dans un cluster
 * Kubernetes et communiquer avec les autres services via DNS interne.
 *
 * La configuration de l'app Express (middlewares, routes) vit dans
 * app.js afin de pouvoir être testée avec Supertest sans ouvrir
 * de port réseau. Ce fichier ne fait que démarrer le serveur.
 */

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Product Service démarré avec succès !`);
  console.log(`📦 URL : http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health Check : http://0.0.0.0:${PORT}/health`);
  console.log(`📋 Produits : http://0.0.0.0:${PORT}/api/products\n`);
});
