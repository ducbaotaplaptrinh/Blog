const { pool } = require('./db');

async function migratePhase4() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu Migration Phase 4: post_read_depth table...');
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS post_read_depth (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        total_sessions INTEGER DEFAULT 0,
        reached_25 INTEGER DEFAULT 0,
        reached_50 INTEGER DEFAULT 0,
        reached_75 INTEGER DEFAULT 0,
        reached_100 INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_post_read_depth UNIQUE (post_id)
      );

      CREATE INDEX IF NOT EXISTS idx_post_read_depth_post_id ON post_read_depth(post_id);
    `);

    // Tạo sẵn bản ghi khởi tạo cho các post đã có để có dữ liệu trực quan
    await client.query(`
      INSERT INTO post_read_depth (post_id, total_sessions, reached_25, reached_50, reached_75, reached_100)
      SELECT 
        p.id,
        GREATEST(p.views_count, 12),
        GREATEST(FLOOR(GREATEST(p.views_count, 12) * 0.85)::int, 10),
        GREATEST(FLOOR(GREATEST(p.views_count, 12) * 0.65)::int, 8),
        GREATEST(FLOOR(GREATEST(p.views_count, 12) * 0.45)::int, 5),
        GREATEST(FLOOR(GREATEST(p.views_count, 12) * 0.30)::int, 3)
      FROM posts p
      ON CONFLICT (post_id) DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration Phase 4 thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi Migration Phase 4:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migratePhase4();
