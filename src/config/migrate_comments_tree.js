const { pool } = require('./db');

async function migrateCommentsTree() {
  const client = await pool.connect();
  try {
    console.log('🔄 Bắt đầu Migration: Thêm parent_id và status cho bảng comments...');
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;

      ALTER TABLE comments 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' 
      CHECK (status IN ('approved', 'pending', 'hidden', 'deleted'));

      CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);
    `);

    // Cập nhật các comment hiện hữu (nếu status đang NULL thì gán 'approved')
    await client.query(`
      UPDATE comments 
      SET status = 'approved' 
      WHERE status IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration comments tree thành công!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi khi Migration comments tree:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateCommentsTree();
