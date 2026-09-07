/**
 * =============================================================
 * Order Service - Tests (Jest + Supertest)
 * =============================================================
 *
 * Le Order Service appelle le Product Service via `fetch` pour
 * vérifier l'existence de chaque produit avant de créer une
 * commande. Dans ces tests, `global.fetch` est mocké afin de ne
 * dépendre d'aucun service externe réel (tests rapides, isolés,
 * reproductibles en CI/CD).
 */

const request = require('supertest');
const app = require('../app');
const { orders } = require('../data/orders');

beforeEach(() => {
  // Réinitialise les commandes en mémoire avant chaque test
  orders.length = 0;
  // Réinitialise le mock de fetch entre chaque test
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Simule une réponse réussie du Product Service pour un produit donné.
 */
function mockProductFound(product) {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: true, data: product })
  });
}

/**
 * Simule un produit introuvable côté Product Service.
 */
function mockProductNotFound() {
  global.fetch.mockResolvedValueOnce({
    json: async () => ({ success: false })
  });
}

describe('Order Service - /health', () => {
  it('retourne un status 200 et le statut UP', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.service).toBe('order-service');
    expect(res.body.status).toBe('UP');
  });
});

describe('Order Service - GET /api/orders', () => {
  it('retourne une liste vide au départ', async () => {
    const res = await request(app).get('/api/orders');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(0);
    expect(res.body.data).toEqual([]);
  });
});

describe('Order Service - GET /api/orders/:id', () => {
  it('retourne 400 pour un ID non numérique', async () => {
    const res = await request(app).get('/api/orders/abc');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('retourne 404 pour une commande inexistante', async () => {
    const res = await request(app).get('/api/orders/9999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('retourne le détail d\'une commande existante', async () => {
    mockProductFound({ id: 1, name: 'Souris', price: 10 });

    const created = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, quantity: 2 }] });

    const res = await request(app).get(`/api/orders/${created.body.data.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(created.body.data.id);
  });
});

describe('Order Service - POST /api/orders', () => {
  it('retourne 400 si items est manquant ou vide', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('retourne 400 si un item n\'a pas de productId ou de quantity', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1 }] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('crée une commande quand tous les produits sont valides', async () => {
    mockProductFound({ id: 1, name: 'Souris', price: 10 });
    mockProductFound({ id: 2, name: 'Clavier', price: 25 });

    const res = await request(app)
      .post('/api/orders')
      .send({
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.total).toBe(45); // 10*2 + 25*1
    expect(res.body.data.items).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('retourne 404 si un produit n\'existe pas dans le catalogue', async () => {
    mockProductNotFound();

    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 9999, quantity: 1 }] });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('retourne 503 si le Product Service est injoignable', async () => {
    global.fetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 1, quantity: 1 }] });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
  });
});
