const { pool } = require('./db');

async function migratePhase5() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu Migration Phase 5: likes_count, shares_count & post_likes table...');
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
    `);

    // Gán một số lượt likes mẫu nếu có post để hiển thị trực quan
    await client.query(`
      UPDATE posts 
      SET likes_count = GREATEST(likes_count, 8),
          shares_count = GREATEST(shares_count, 3)
      WHERE status = 'published' OR is_published = true;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration Phase 5 thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi Migration Phase 5:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migratePhase5();
