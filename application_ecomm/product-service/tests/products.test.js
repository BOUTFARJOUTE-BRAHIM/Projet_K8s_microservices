/**
 * =============================================================
 * Product Service - Tests (Jest + Supertest)
 * =============================================================
 *
 * On teste directement l'app Express exportée par app.js, sans
 * démarrer de vrai serveur HTTP (pas de port ouvert, tests rapides
 * et isolés, adaptés à une pipeline CI/CD).
 */

const request = require('supertest');
const app = require('../app');
const products = require('../data/products');

describe('Product Service - /health', () => {
  it('retourne un status 200 et le statut UP', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.service).toBe('product-service');
    expect(res.body.status).toBe('UP');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Product Service - GET /api/products', () => {
  it('retourne la liste complète des produits', async () => {
    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(products.length);
    expect(res.body.data).toHaveLength(products.length);
  });

  it('filtre les produits par catégorie (insensible à la casse)', async () => {
    const res = await request(app).get('/api/products?category=audio');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((p) => p.category.toLowerCase() === 'audio')).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('retourne une liste vide pour une catégorie inexistante', async () => {
    const res = await request(app).get('/api/products?category=inexistante');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });
});

describe('Product Service - GET /api/products/:id', () => {
  it('retourne le détail d\'un produit existant', async () => {
    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
  });

  it('retourne 404 pour un produit inexistant', async () => {
    const res = await request(app).get('/api/products/9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('retourne 400 pour un ID non numérique', async () => {
    const res = await request(app).get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Product Service - Route inconnue', () => {
  it('retourne 404 pour une route non définie', async () => {
    const res = await request(app).get('/api/route-inexistante');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
