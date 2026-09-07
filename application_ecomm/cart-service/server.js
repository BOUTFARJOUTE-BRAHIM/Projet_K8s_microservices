/**
 * =============================================================
 * Cart Service - Point d'entrée du microservice
 * =============================================================
 *
 * Microservice responsable de la gestion du panier d'achat.
 *
 * Fonctionnalités :
 *   - Afficher le contenu du panier
 *   - Ajouter un produit au panier
 *   - Supprimer un produit du panier
 *
 * Port par défaut : 3002
 *
 * La configuration de l'app Express vit dans app.js afin de
 * pouvoir être testée avec Supertest sans ouvrir de port réseau.
 */

const app = require('./app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`\n🛒 Cart Service démarré avec succès !`);
  console.log(`📦 URL : http://0.0.0.0:${PORT}`);
  console.log(`❤️  Health Check : http://0.0.0.0:${PORT}/health`);
  console.log(`🛒 Panier : http://0.0.0.0:${PORT}/api/cart\n`);
});
