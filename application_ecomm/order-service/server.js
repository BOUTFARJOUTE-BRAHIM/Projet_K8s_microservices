/**
 * =============================================================
 * Order Service - Point d'entrée du microservice
 * =============================================================
 *
 * Microservice responsable de la gestion des commandes.
 *
 * Fonctionnalités :
 *   - Créer une commande (avec vérification via Product Service)
 *   - Consulter toutes les commandes
 *   - Consulter une commande spécifique
 *
 * Communication inter-services :
 *   → Product Service (http://product-service:3001)
 *     pour vérifier l'existence des produits
 *
 * Port par défaut : 3003
 *
 * La configuration de l'app Express vit dans app.js afin de
 * pouvoir être testée avec Supertest sans ouvrir de port réseau.
 */

const app = require('./app');

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`\n📦 Order Service démarré avec succès !`);
  console.log(`📦 URL : http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health Check : http://0.0.0.0:${PORT}/health`);
  console.log(`📋 Commandes : http://0.0.0.0:${PORT}/api/orders`);
  console.log(`🔗 Product Service URL : ${process.env.PRODUCT_SERVICE_URL || 'http://product-srv:3001'}\n`);
});
