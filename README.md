# 🛍️ E-Shop Microservices — Projet Kubernetes

Application e-commerce démonstrative construite en **architecture microservices**, conteneurisée avec Docker et déployée sur un cluster **Kubernetes (k3s)** avec base de données PostgreSQL haute disponibilité (CloudNativePG), ingress Traefik et certificats TLS automatiques (cert-manager / Let's Encrypt).

Le projet combine volontairement plusieurs stacks technologiques (Node.js/Express, Python/Flask, Python/Django, Next.js) pour illustrer une architecture polyglotte réaliste où chaque équipe/service choisit sa propre techno, tant que le contrat REST est respecté.

---

## 📐 Architecture générale

```
                              ┌─────────────────────────┐
                              │      Utilisateur         │
                              └────────────┬─────────────┘
                                           │ HTTPS (appmarket.work.gd)
                                  ┌────────▼─────────┐
                                  │  Ingress Traefik   │  (cert-manager / Let's Encrypt)
                                  └────────┬─────────┘
                                           │
                                  ┌────────▼─────────┐
                                  │  frontend (Next.js)│  NodePort 30090 → :3000
                                  │  Server Components  │
                                  │  + Server Actions    │
                                  └───┬───┬───┬───┬───┬─┘
                    ┌─────────────────┘   │   │   │   └───────────────┐
                    │            ┌────────┘   │   └────────┐          │
                    ▼            ▼            ▼            ▼          ▼
          ┌─────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
          │product-srv   │ │cart-srv     │ │order-srv  │ │user-srv   │ │review-srv │
          │Node/Express  │ │Node/Express │ │Node/Express│ │Django REST│ │Django REST│
          │:3001         │ │:3002        │ │:3003       │ │:8001       │ │:8002      │
          └──────┬───────┘ └──────┬─────┘ └─────┬──────┘ └─────┬──────┘ └─────┬─────┘
                 │                 │              │ (vérifie produit)│              │
                 └─────────────────┴──────────────┴──────┬─────────┴──────────────┘
                                                            │
                                                   ┌────────▼─────────┐
                                                   │  database01        │  (Service ExternalName)
                                                   │  → clusterdb-rw     │
                                                   └────────┬─────────┘
                                                   ┌────────▼─────────┐
                                                   │ Cluster PostgreSQL  │
                                                   │ CloudNativePG (cnpg)│
                                                   │ 3 instances / 1Gi   │
                                                   └────────────────────┘

          ┌──────────────┐
          │article-srv    │  Flask — blog/actualités, indépendant des autres domaines
          │:5001          │
          └───────────────┘
```

Le **frontend Next.js** est le seul point d'entrée exposé côté navigateur : toutes les requêtes vers les microservices partent du serveur Next.js (Server Components / Server Actions), jamais du navigateur. Les URLs internes des services ne sont donc jamais exposées côté client.

Le **order-service** illustre la communication inter-services côté back : avant de créer une commande, il interroge le **product-service** via HTTP (`http://product-srv:3001/api/products/:id`) pour valider l'existence et le prix de chaque article.

---

## 🧩 Les microservices

| Service | Techno | Port | Base de données (tables) | Rôle |
|---|---|---|---|---|
| **product-service** | Node.js / Express + `pg` | 3001 | `products` | Catalogue produits (CRUD lecture, filtres) |
| **cart-service** | Node.js / Express + `pg` | 3002 | `cart_items` | Gestion du panier (ajout, suppression, total) |
| **order-service** | Node.js / Express + `pg` | 3003 | `orders`, `order_items` | Création/consultation des commandes ; appelle `product-service` |
| **user-service** | Python / Django + DRF | 8001 | `users` | CRUD utilisateurs |
| **review-service** | Python / Django + DRF | 8002 | `reviews` | Avis produits + statistiques par produit |
| **article-service** | Python / Flask + SQLAlchemy | 5001 | `articles` | Blog / articles éditoriaux (CRUD) |
| **nextjs-frontend** | Next.js 14 (App Router) | 3000 | — | Interface utilisateur, SSR + Server Actions |

Chaque service Node.js/Flask possède son propre `Dockerfile`, `package.json`/`requirements.txt` et une suite de tests (`tests/`) avec Jest+Supertest (Node) ou pytest (Flask). Les services Django (`user-service`, `review-service`) utilisent des modèles avec `managed = False` : les tables sont créées par le script SQL `init-db.sql`, pas par les migrations Django, afin de garder un schéma unique partagé.

### Détail des endpoints REST

**product-service** (`:3001/api/products`)
- `GET /` — liste des produits (filtrable)
- `GET /:id` — détail d'un produit

**cart-service** (`:3002/api/cart`)
- `GET /` — contenu du panier + total
- `POST /` — ajouter un produit (incrémente la quantité si déjà présent)
- `DELETE /:productId` — retirer un produit

**order-service** (`:3003/api/orders`)
- `GET /` — liste des commandes avec leurs articles
- `GET /:id` — détail d'une commande
- `POST /` — créer une commande (vérifie chaque produit auprès de `product-service`, transaction SQL `BEGIN/COMMIT`)

**user-service** (`:8001/api/users/`)
- `GET /` — liste des utilisateurs
- `POST /` — créer un utilisateur
- `GET /:id/` — détail
- `PUT /:id/` — modifier
- `DELETE /:id/` — supprimer

**review-service** (`:8002/api/reviews/`)
- `GET /` — liste des avis (filtrable par `product_id`)
- `POST /` — soumettre un avis
- `GET /:id/` — détail d'un avis
- `DELETE /:id/` — supprimer
- `GET /product/:id/stats/` — statistiques (note moyenne, nombre d'avis) pour un produit

**article-service** (`:5001/api/articles`)
- `GET /` — liste (filtres `category`, `author`, `published`)
- `GET /:id` — détail
- `POST /` — créer
- `PUT /:id` — modifier
- `DELETE /:id` — supprimer

Chaque microservice expose également un endpoint **`/health`** utilisé par Kubernetes (liveness/readiness) et renvoyant `{ service, status: "UP", timestamp }`.

---

## 🖥️ Frontend (nextjs-frontend)

Frontend **Next.js 14 (App Router)** qui remplace une version antérieure en React + Vite. Le choix de Next.js répond à un objectif précis : que **toutes les requêtes vers les microservices partent du serveur**, jamais du navigateur.

Différences clés par rapport à une SPA classique :

| Avant (React + Vite) | Maintenant (Next.js) |
|---|---|
| Appels API déclenchés dans `useEffect`, côté navigateur | Appels effectués uniquement dans des **Server Components** (`lib/api.js`, marqué `server-only`) |
| URLs des services exposées au client (`VITE_*`) | URLs connues uniquement du serveur, jamais envoyées au bundle JS |
| CORS obligatoire sur chaque microservice | CORS non indispensable en production (le navigateur ne parle qu'au frontend) |
| `fetch()` déclenché au clic | **Server Actions** (`lib/actions.js`, `'use server'`) + `revalidatePath()` pour rafraîchir les données |

Structure :
```
app/
  layout.jsx        # récupère le panier (badge) côté serveur
  page.jsx           # page Produits
  articles/page.jsx  # page Articles/blog
  cart/page.jsx       # page Panier
  orders/page.jsx     # page Commandes
  users/page.jsx       # page Utilisateurs
components/           # Navbar, ProductGrid, CartView, ArticleGrid,
                       # ProductReviewsModal, UserList (Client Components)
lib/
  config.js           # URLs des microservices (server-only)
  api.js              # appels HTTP vers les microservices (server-only)
  actions.js          # Server Actions pour les mutations
```

Variables d'environnement (serveur uniquement, sans préfixe `NEXT_PUBLIC_`) :
```
PRODUCT_SERVICE_URL=http://product-srv:3001
CART_SERVICE_URL=http://cart-srv:3002
ORDER_SERVICE_URL=http://order-srv:3003
USER_SERVICE_URL=http://user-srv:8001
REVIEW_SERVICE_URL=http://review-srv:8002
ARTICLE_SERVICE_URL=http://article-srv:5001
```
Si ces variables ne sont pas définies, `lib/config.js` retombe sur les noms DNS Kubernetes par défaut (`http://product-service:3001`, etc.).

---

## 🗄️ Base de données

Une seule base PostgreSQL nommée **`ecommerce`**, partagée par tous les microservices, initialisée par `application_ecomm/init-db.sql` :

| Table | Utilisée par | Colonnes principales |
|---|---|---|
| `products` | product-service | name, description, price, category, image, stock, rating |
| `cart_items` | cart-service | product_id, name, price, quantity |
| `orders` / `order_items` | order-service | total, status, created_at / order_id (FK), product_id, price, quantity |
| `users` | user-service | email, username, first_name, last_name, phone, address, is_active |
| `reviews` | review-service | product_id, user_name, rating (1-5), comment |
| `articles` | article-service | title, content, author, category, image, published |

Le script insère aussi des **données de démonstration** (produits Apple/Sony/Samsung/Dell/Logitech, 3 utilisateurs, avis, articles de blog).

En production (Kubernetes), la base est gérée par l'opérateur **CloudNativePG** (`k8s_yaml_files/db/postgres.yaml`) : un `Cluster` `clusterdb` avec **3 instances** et **1 Gi** de stockage, exposé au reste du cluster via un service en lecture-écriture (`clusterdb-rw`).

---

## ☸️ Déploiement Kubernetes

Tous les manifests se trouvent dans `k8s_yaml_files/` :

```
k8s_yaml_files/
  configmap_secret/
    configmap.yaml        # DB_HOST, DB_PORT, DB_NAME (config non sensible)
    secret.yaml            # DB_USER, DB_PASSWORD (config sensible)
  db/
    postgres.yaml           # Cluster CloudNativePG (cnpg.io)
  deployment/
    article_deployment.yaml
    cart_deployment.yaml
    front_deployment.yaml
    order_deployment.yaml
    product_deployment.yaml
    review_deployment.yaml
    users_deployment.yaml
  svc/
    externalname.yaml       # Service "database01" → alias DNS vers clusterdb-rw
    svc_article.yaml / svc_cart.yaml / svc_front.yaml
    svc_order.yaml / svc_product.yaml / svc_review.yaml / svc_users.yaml
  ingresScertmanager/
    ingress.yaml             # Ingress Traefik (host: appmarket.work.gd)
    certificate.yaml          # Certificate cert-manager
    clusterissuer.yaml         # ClusterIssuer Let's Encrypt (prod)
```

### Points clés

- **Config & secrets** : chaque `Deployment` injecte les variables d'environnement via `envFrom` (ConfigMap `configmapprojetk3s` + Secret `secretprojetk3s`), donc `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` sont communs à tous les services.
- **Résolution de la base** : le Service `database01` (type `ExternalName`) redirige vers `clusterdb-rw.default.svc.cluster.local`, le service en lecture/écriture généré par CloudNativePG. C'est ce nom (`database01`) qui est utilisé comme `DB_HOST` dans la ConfigMap.
- **Services internes** : chaque microservice backend a un `Service` `ClusterIP` (`product-srv`, `cart-srv`, `order-srv`, `user-srv`, `review-srv`, `article-srv`) — non exposés à l'extérieur du cluster.
- **Exposition du frontend** : le Service `frontend` est de type `NodePort` (port `30090` → conteneur `3000`).
- **Entrée HTTPS** : l'`Ingress` Traefik route `appmarket.work.gd` vers le service `frontend` (port 80), avec TLS géré automatiquement par `cert-manager` via un `ClusterIssuer` Let's Encrypt (production, challenge HTTP-01).
- **Ressources** : chaque pod backend déclare des *requests* (300Mi RAM / 200m CPU) et *limits* (500Mi RAM / 300m CPU).
- **Images Docker** : toutes préfixées `brahimbtf/<service>-k3s-app` (ex. `brahimbtf/product-k3s-app`, `brahimbtf/front-k3s-app`), publiées sur Docker Hub.

> ⚠️ Le nom du service `database01` (attendu par la ConfigMap) et le nom du Cluster PostgreSQL `clusterdb` sont deux ressources différentes reliées par le Service `ExternalName` — pensez à appliquer `svc/externalname.yaml` **après** que l'opérateur CloudNativePG ait créé `clusterdb-rw`.

### Ordre d'application recommandé

```bash
# 1. Config & secrets
kubectl apply -f k8s_yaml_files/configmap_secret/

# 2. Base de données (nécessite l'opérateur CloudNativePG installé au préalable)
kubectl apply -f k8s_yaml_files/db/postgres.yaml
kubectl apply -f k8s_yaml_files/svc/externalname.yaml

# 3. Initialiser le schéma (une fois la base prête)
kubectl exec -it <pod-postgres> -- psql -U postgres -d ecommerce -f init-db.sql

# 4. Déploiements applicatifs
kubectl apply -f k8s_yaml_files/deployment/

# 5. Services internes + frontend
kubectl apply -f k8s_yaml_files/svc/

# 6. Ingress + TLS (nécessite Traefik + cert-manager installés)
kubectl apply -f k8s_yaml_files/ingresScertmanager/
```

---

## 🐳 Exécution locale (Docker)

Chaque service peut être construit et lancé indépendamment :

```bash
# Exemple : product-service
cd application_ecomm/product-service
docker build -t product-service .
docker run -p 3001:3001 \
  -e DB_HOST=<host> -e DB_PORT=5432 -e DB_USER=<user> \
  -e DB_PASSWORD=<pass> -e DB_NAME=ecommerce \
  product-service
```

Répéter pour `cart-service` (3002), `order-service` (3003, + `PRODUCT_SERVICE_URL`), `user-service` (8001), `review-service` (8002), `article-service` (5001), puis initialiser PostgreSQL avec `application_ecomm/init-db.sql` et lancer le frontend :

```bash
cd application_ecomm/nextjs-frontend
npm install
cp .env .env.local   # ajuster les URLs (ex. http://localhost:3001 pour PRODUCT_SERVICE_URL)
npm run dev           # http://localhost:3000
```

---

## ✅ Tests & qualité de code

- **Services Node.js** (`product`, `cart`, `order`) : tests unitaires/intégration avec **Jest** + **Supertest** (`tests/*.test.js`), exécutables via `npm test`. `product-service` exporte en plus un rapport JUnit (`jest-junit`) dans `reports/junit.xml`.
- **Services Python** : `article-service` (Flask) utilise **pytest** (`tests/test_articles.py`) ; `user-service` et `review-service` (Django) utilisent le framework de test intégré Django (`tests.py`).
- **Analyse statique** : le projet contient une configuration **SonarQube** (`application_ecomm/.scannerwork/`, projet `projettestsonar`), utilisée pour l'analyse de qualité/sécurité du code source.

---

## 📁 Arborescence complète

```
Projet_K8s_microservices-main/
├── application_ecomm/
│   ├── init-db.sql                  # schéma + données de démo (toutes les tables)
│   ├── README.md
│   ├── article-service/             # Flask
│   │   ├── app.py / config.py / models.py
│   │   ├── routes/articles.py
│   │   ├── tests/test_articles.py
│   │   ├── requirements.txt / Dockerfile
│   ├── cart-service/                # Node/Express
│   │   ├── app.js / server.js / db.js
│   │   ├── routes/cart.js
│   │   ├── tests/cart.test.js
│   │   ├── package.json / Dockerfile
│   ├── order-service/               # Node/Express (appelle product-service)
│   ├── product-service/             # Node/Express
│   ├── review-service/              # Django REST
│   │   ├── review_service/ (settings, urls, wsgi)
│   │   └── reviews/ (models, serializers, views, urls, tests)
│   ├── user-service/                # Django REST
│   │   ├── user_service/ (settings, urls, wsgi)
│   │   └── users/ (models, serializers, views, urls, tests)
│   └── nextjs-frontend/             # Next.js 14
│       ├── app/ (page.jsx, articles/, cart/, orders/, users/)
│       ├── components/
│       └── lib/ (config.js, api.js, actions.js)
└── k8s_yaml_files/
    ├── configmap_secret/
    ├── db/
    ├── deployment/
    ├── svc/
    └── ingresScertmanager/
```

---

## 🔧 Stack technique récapitulative

| Catégorie | Technologies |
|---|---|
| Backend | Node.js 20 / Express, Python 3.12 / Flask, Python / Django REST Framework |
| Frontend | Next.js 14 (App Router), React 18 |
| Base de données | PostgreSQL (opérateur CloudNativePG en cluster HA) |
| Conteneurisation | Docker (images `node:20-alpine`, `python:3.12-slim`) |
| Orchestration | Kubernetes (k3s), Traefik (Ingress Controller) |
| Sécurité / TLS | cert-manager + Let's Encrypt (ClusterIssuer) |
| Qualité de code | SonarQube |
| Tests | Jest + Supertest (Node.js), pytest (Flask), Django TestCase |

---

## 📝 Notes

- Toutes les communications entre le frontend et les microservices passent par le serveur Next.js (Server Components / Server Actions) : aucune URL de service interne n'est jamais exposée au navigateur.
- La communication **order-service → product-service** illustre un pattern classique de vérification synchrone entre microservices via API REST.
- Le fichier `k8s_yaml_files/db/postgres.yaml` nécessite que l'opérateur **CloudNativePG** soit déjà installé sur le cluster (CRD `postgresql.cnpg.io`).
- L'Ingress cible le nom d'hôte `appmarket.work.gd` — à adapter selon votre propre nom de domaine.
