/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Les 3 microservices ne sont JAMAIS appelés depuis le navigateur :
  // toutes les requêtes passent par le serveur Next.js (Server Components
  // + Server Actions). Aucune variable d'environnement NEXT_PUBLIC_* n'est
  // donc nécessaire ici : les URLs des services restent côté serveur.
};

module.exports = nextConfig;
