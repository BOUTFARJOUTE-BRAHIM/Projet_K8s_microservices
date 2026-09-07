

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Log de connexion au démarrage
pool.on('connect', () => {
  console.log('📦 Product Service connecté à PostgreSQL (database01)');
});

pool.on('error', (err) => {
  console.error('❌ Erreur inattendue sur le pool PostgreSQL :', err);
  process.exit(-1);
});

module.exports = pool;
