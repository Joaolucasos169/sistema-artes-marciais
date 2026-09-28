const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para a conexão SSL do Neon
  },
});

pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL (Neon) com sucesso!');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};