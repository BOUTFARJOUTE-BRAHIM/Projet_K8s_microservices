/**
 * =============================================================
 * Product Service - Données en mémoire (In-Memory Data Store)
 * =============================================================
 * 
 * Ce fichier contient la liste des produits stockés en mémoire.
 * Pas de base de données : on utilise un simple tableau JavaScript.
 * Les données seront réinitialisées à chaque redémarrage du service.
 */

const products = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    description: "Ordinateur portable Apple avec puce M3 Pro, 18 Go RAM, 512 Go SSD. Écran Liquid Retina XDR.",
    price: 2799.00,
    category: "Ordinateurs",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202301",
    stock: 15,
    rating: 4.8
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    description: "Smartphone Apple avec puce A17 Pro, écran Super Retina XDR 6.1\", système de caméra pro.",
    price: 1229.00,
    category: "Smartphones",
    image: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select",
    stock: 42,
    rating: 4.7
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    description: "Casque audio sans fil à réduction de bruit, autonomie 30h, son Hi-Res Audio.",
    price: 349.00,
    category: "Audio",
    image: "https://www.sony.fr/image/5d02da5df552836db894cead8a68f5f3",
    stock: 28,
    rating: 4.6
  },
  {
    id: 4,
    name: "Samsung Galaxy Tab S9",
    description: "Tablette Samsung avec écran AMOLED 11\", processeur Snapdragon 8 Gen 2, 128 Go.",
    price: 899.00,
    category: "Tablettes",
    image: "https://images.samsung.com/is/image/samsung/p6pim/fr/sm-x710nzaaeub/gallery/fr-galaxy-tab-s9",
    stock: 20,
    rating: 4.5
  },
  {
    id: 5,
    name: "Logitech MX Master 3S",
    description: "Souris sans fil ergonomique, capteur 8000 DPI, rechargeable USB-C, multi-appareils.",
    price: 109.00,
    category: "Accessoires",
    image: "https://resource.logitechg.com/w_386,ar_1.0,c_limit/d_transparent.gif/content/dam/gaming/en/non-702702702702702702702702702702702702-702702702702702702702702702702702702-702702702702702702702702702702702702.png",
    stock: 55,
    rating: 4.9
  },
  {
    id: 6,
    name: "Dell UltraSharp U2723QE",
    description: "Moniteur 4K UHD 27\", IPS Black, USB-C Hub, HDR 400, 100% sRGB.",
    price: 579.00,
    category: "Écrans",
    image: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2723qe",
    stock: 12,
    rating: 4.7
  }
];

module.exports = products;
