/**
 * =============================================================
 * Cart Service - Tests (Jest + Supertest)
 * =============================================================
 *
 * Le panier est un tableau en mémoire partagé entre les requêtes
 * (cf. data/cart.js). On le réinitialise avant chaque test pour
 * garantir l'isolation entre les cas de test.
 */

const request = require('supertest');
const app = require('../app');
const cart = require('../data/cart');

beforeEach(() => {
  // Vide le panier en mémoire avant chaque test
  cart.length = 0;
});

describe('Cart Service - /health', () => {
  it('retourne un status 200 et le statut UP', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.service).toBe('cart-service');
    expect(res.body.status).toBe('UP');
  });
});

describe('Cart Service - GET /api/cart', () => {
  it('retourne un panier vide au départ', async () => {
    const res = await request(app).get('/api/cart');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(0);
    expect(res.body.total).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  it('calcule correctement le total du panier', async () => {
    await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10, quantity: 2 });
    await request(app)
      .post('/api/cart')
      .send({ productId: 2, name: 'Clavier', price: 25, quantity: 1 });

    const res = await request(app).get('/api/cart');

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.total).toBe(45);
  });
});

describe('Cart Service - POST /api/cart', () => {
  it('ajoute un nouveau produit au panier', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ productId: 1, name: 'Souris', price: 10, quantity: 2 });
  });

  it('utilise une quantité par défaut de 1 si non précisée', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10 });

    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(1);
  });

  it('incrémente la quantité si le produit existe déjà', async () => {
    await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10, quantity: 1 });

    const res = await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10, quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(4);
  });

  it('retourne 400 si des champs obligatoires manquent', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Cart Service - DELETE /api/cart/:productId', () => {
  it('supprime un produit existant du panier', async () => {
    await request(app)
      .post('/api/cart')
      .send({ productId: 1, name: 'Souris', price: 10, quantity: 1 });

    const res = await request(app).delete('/api/cart/1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.productId).toBe(1);

    const after = await request(app).get('/api/cart');
    expect(after.body.count).toBe(0);
  });

  it('retourne 404 si le produit n\'est pas dans le panier', async () => {
    const res = await request(app).delete('/api/cart/999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('retourne 400 pour un productId non numérique', async () => {
    const res = await request(app).delete('/api/cart/abc');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
