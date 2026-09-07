# E-Shop Microservices — Frontend Next.js (Server-Side Rendering)

Ce dossier remplace le frontend `frontend/` (React + Vite) de l'archive
d'origine par une application **Next.js 14 (App Router)**. L'objectif
demandé : que les requêtes vers les microservices (`product-service`,
`cart-service`, `order-service`) partent **du serveur**, et non plus du
navigateur.

## Ce qui a changé par rapport à la version Vite

| Ancien (Vite + React) | Nouveau (Next.js) |
|---|---|
| `src/services/api.js` appelé depuis `useEffect` **dans le navigateur** | `lib/api.js`, marqué `server-only`, appelé uniquement depuis des **Server Components** |
| URLs des services exposées au client via `VITE_*` (visibles dans le bundle JS) | URLs des services connues **uniquement du serveur** (`PRODUCT_SERVICE_URL`, etc., sans préfixe `NEXT_PUBLIC_`) |
| CORS nécessaire sur les 3 microservices (`app.use(cors())`) | Le navigateur ne parle plus jamais directement aux microservices : CORS n'est plus indispensable en production |
| `fetch()` direct au clic sur "Ajouter au panier" / "Supprimer" / "Commander" | **Server Actions** (`lib/actions.js`, `'use server'`) : le clic déclenche une fonction qui s'exécute côté serveur, puis `revalidatePath()` rafraîchit les données |
| Liste des produits chargée après le premier rendu (spinner puis contenu) | Produits déjà rendus dans le HTML envoyé par le serveur (Server Component `app/page.jsx`) |

## Structure

```
app/
  layout.jsx        Server Component racine : récupère le panier (pour le badge) côté serveur
  page.jsx           Page Produits (Server Component -> ProductGrid)
  cart/page.jsx       Page Panier (Server Component -> CartView)
  orders/page.jsx     Page Commandes (Server Component pur, lecture seule)
  globals.css         Styles (repris à l'identique de l'ancien frontend)
components/
  Navbar.jsx          Client Component (lien actif, badge panier reçu en props)
  ProductGrid.jsx     Client Component (interactivité "Ajouter au panier")
  CartView.jsx        Client Component (suppression, passage de commande)
lib/
  config.js           URLs des microservices (server-only)
  api.js              Appels HTTP vers les microservices (server-only)
  actions.js          Server Actions ('use server') pour les mutations
```

> Remarque : `app/orders/page.jsx` est une page nouvelle — l'archive
> d'origine appelait déjà `getOrders()` dans `src/services/api.js` et
> `Cart.jsx` y renvoyait l'utilisateur après une commande, mais aucun
> composant `Orders` n'était présent dans le zip fourni. Il a été
> recréé en réutilisant le même Order Service et le même style visuel.
> De même, `src/App.jsx` (qui assemblait `Navbar` / `ProductList` /
> `Cart`) était absent du zip : la structure a été reconstituée à
> partir des classes CSS (`navbar__*`, `page-title`, etc.) et de la
> logique de navigation visible dans `Cart.jsx` (`onNavigate`).

## Installation et lancement

```bash
cd nextjs-frontend
npm install
cp .env.local.example .env.local   # puis ajuster les URLs si besoin
npm run dev
```

Par défaut (sans `.env.local`), les URLs pointent vers les noms DNS
Kubernetes (`http://product-service:3001`, etc.), comme dans l'archive
d'origine. En local, démarrez les 3 microservices (`product-service`,
`cart-service`, `order-service` du zip d'origine) puis renseignez
`.env.local` avec `http://localhost:3001`, `3002`, `3003`.

## Déploiement Kubernetes

Le comportement est identique à l'ancien frontend : construire l'image
(`next build` puis `next start`, ou `output: 'standalone'` dans
`next.config.js` pour une image plus légère), et laisser les valeurs
par défaut de `lib/config.js` résoudre les noms DNS internes du
cluster. Aucune variable d'environnement `NEXT_PUBLIC_*` à fournir au
build, contrairement aux anciennes `VITE_*_SERVICE_URL`.
