const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Bắt buộc đối với kết nối Supabase Cloud PostgreSQL
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'blog_db',
    };

const pool = new Pool(poolConfig);

// Kiểm tra kết nối CSDL
pool.on('connect', () => {
  console.log('✅ PostgreSQL Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
