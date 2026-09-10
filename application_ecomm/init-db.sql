-- =============================================================
-- Création de la base de données (si elle n'existe pas déjà)
-- Exécuter cette commande séparément si nécessaire :
CREATE DATABASE ecommerce;
-- =============================================================
CREATE USER brahim WITH PASSWORD 'if you create a password ensure that the same password is in secretfile in K8S';
GRANT ALL PRIVILEGES ON DATABASE ecommerce TO brahim ;
-- =============================================================
-- TABLE : products (utilisée par product-service)
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    category    VARCHAR(100)   NOT NULL,
    image       TEXT,
    stock       INTEGER        NOT NULL DEFAULT 0,
    rating      DECIMAL(2, 1)  DEFAULT 0.0
);

-- Insertion des données initiales des produits
INSERT INTO products (name, description, price, category, image, stock, rating) VALUES
(
    'MacBook Pro 16"',
    'Ordinateur portable Apple avec puce M3 Pro, 18 Go RAM, 512 Go SSD. Écran Liquid Retina XDR.',
    2799.00,
    'Ordinateurs',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202301',
    15,
    4.8
),
(
    'iPhone 15 Pro',
    'Smartphone Apple avec puce A17 Pro, écran Super Retina XDR 6.1", système de caméra pro.',
    1229.00,
    'Smartphones',
    'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select',
    42,
    4.7
),
(
    'Sony WH-1000XM5',
    'Casque audio sans fil à réduction de bruit, autonomie 30h, son Hi-Res Audio.',
    349.00,
    'Audio',
    'https://www.sony.fr/image/5d02da5df552836db894cead8a68f5f3',
    28,
    4.6
),
(
    'Samsung Galaxy Tab S9',
    'Tablette Samsung avec écran AMOLED 11", processeur Snapdragon 8 Gen 2, 128 Go.',
    899.00,
    'Tablettes',
    'https://images.samsung.com/is/image/samsung/p6pim/fr/sm-x710nzaaeub/gallery/fr-galaxy-tab-s9',
    20,
    4.5
),
(
    'Logitech MX Master 3S',
    'Souris sans fil ergonomique, capteur 8000 DPI, rechargeable USB-C, multi-appareils.',
    109.00,
    'Accessoires',
    'https://resource.logitechg.com/w_386,ar_1.0,c_limit/d_transparent.gif/content/dam/gaming/en/non-702702702702702702702702702702702702-702702702702702702702702702702702702-702702702702702702702702702702702702.png',
    55,
    4.9
),
(
    'Dell UltraSharp U2723QE',
    'Moniteur 4K UHD 27", IPS Black, USB-C Hub, HDR 400, 100% sRGB.',
    579.00,
    'Écrans',
    'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2723qe',
    12,
    4.7
);


-- =============================================================
-- TABLE : cart_items (utilisée par cart-service)
-- =============================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER        NOT NULL,
    name       VARCHAR(255)   NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    quantity   INTEGER        NOT NULL DEFAULT 1
);


-- =============================================================
-- TABLE : orders (utilisée par order-service)
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
    id         SERIAL PRIMARY KEY,
    total      DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status     VARCHAR(50)    NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP      NOT NULL DEFAULT NOW()
);


-- =============================================================
-- TABLE : order_items (utilisée par order-service)
-- =============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER        NOT NULL,
    name       VARCHAR(255)   NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    quantity   INTEGER        NOT NULL DEFAULT 1
);


-- =============================================================
-- TABLE : users (utilisée par user-service - Django)
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    email      VARCHAR(255)  UNIQUE NOT NULL,
    username   VARCHAR(150)  UNIQUE NOT NULL,
    first_name VARCHAR(100)  NOT NULL DEFAULT '',
    last_name  VARCHAR(100)  NOT NULL DEFAULT '',
    phone      VARCHAR(20)   DEFAULT '',
    address    TEXT           DEFAULT '',
    is_active  BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Insertion des utilisateurs de test
INSERT INTO users (email, username, first_name, last_name, phone, address) VALUES
(
    'brahim@example.com',
    'brahim',
    'Brahim',
    'Boutfarjoute',
    '+212 600 000 001',
    '123 Rue Mohammed V, Casablanca, Maroc'
),
(
    'sarah@example.com',
    'sarah',
    'Sarah',
    'Lemoine',
    '+33 6 12 34 56 78',
    '45 Avenue des Champs-Élysées, Paris, France'
),
(
    'youssef@example.com',
    'youssef',
    'Youssef',
    'El Amrani',
    '+212 600 000 003',
    '78 Boulevard Zerktouni, Rabat, Maroc'
);


-- =============================================================
-- TABLE : reviews (utilisée par review-service - Django)
-- =============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id         SERIAL PRIMARY KEY,
    product_id INTEGER        NOT NULL,
    user_name  VARCHAR(150)   NOT NULL,
    rating     INTEGER        NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT           NOT NULL DEFAULT '',
    created_at TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Insertion des avis de test
INSERT INTO reviews (product_id, user_name, rating, comment) VALUES
(1, 'brahim',  5, 'MacBook Pro incroyable ! Performance et écran au top. Je recommande fortement.'),
(1, 'sarah',   4, 'Très bon ordinateur, mais le prix est un peu élevé.'),
(2, 'youssef', 5, 'iPhone 15 Pro est le meilleur smartphone que j''ai jamais eu.'),
(2, 'brahim',  4, 'Excellente caméra et bonne autonomie. Design premium.'),
(3, 'sarah',   5, 'Le meilleur casque audio sans fil du marché. Réduction de bruit parfaite.'),
(4, 'youssef', 4, 'Tablette performante avec un bel écran AMOLED.'),
(5, 'brahim',  5, 'Souris ergonomique parfaite pour le travail quotidien.'),
(6, 'sarah',   5, 'Moniteur 4K sublime, les couleurs sont fidèles. Idéal pour le design.');


-- =============================================================
-- TABLE : articles (utilisée par article-service - Flask)
-- =============================================================
CREATE TABLE IF NOT EXISTS articles (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255)   NOT NULL,
    content    TEXT           NOT NULL,
    author     VARCHAR(150)   NOT NULL,
    category   VARCHAR(100)   NOT NULL DEFAULT 'Général',
    image      TEXT,
    published  BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Insertion des articles de test
INSERT INTO articles (title, content, author, category, image, published) VALUES
(
    'Les tendances E-commerce en 2025',
    'Le commerce en ligne continue d''évoluer à grande vitesse. L''intelligence artificielle, la réalité augmentée et les expériences personnalisées redéfinissent la façon dont les consommateurs achètent en ligne. Découvrez les principales tendances qui façonnent l''avenir du e-commerce.',
    'Brahim',
    'E-commerce',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    TRUE
),
(
    'Guide : Choisir son MacBook en 2025',
    'Avec la gamme Apple Silicon qui ne cesse de s''améliorer, choisir le bon MacBook peut être un défi. Ce guide compare les MacBook Air M3, MacBook Pro 14" et MacBook Pro 16" pour vous aider à faire le meilleur choix selon vos besoins.',
    'Sarah',
    'Tech',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    TRUE
),
(
    'Microservices vs Monolithique : quel choix pour votre projet ?',
    'L''architecture microservices offre flexibilité et scalabilité, mais elle introduit aussi de la complexité. Cet article explore les avantages et inconvénients des deux approches pour vous aider à choisir la bonne architecture pour votre prochain projet.',
    'Youssef',
    'Tutoriel',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    TRUE
),
(
    'Les meilleurs accessoires pour votre setup en télétravail',
    'Travail à domicile : optimisez votre espace avec les meilleurs accessoires. De la souris ergonomique au moniteur 4K, en passant par le casque à réduction de bruit, voici notre sélection pour un setup productif et confortable.',
    'Brahim',
    'Accessoires',
    'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800',
    FALSE
);
