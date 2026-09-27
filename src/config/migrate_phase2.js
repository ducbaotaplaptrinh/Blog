const db = require('./db');

async function migratePhase2() {
  try {
    console.log('⏳ Running Phase 2 Migration: Post Status & Approval Workflow...');
    
    // 1. Thêm cột status
    await db.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
      UPDATE posts SET status = 'published' WHERE is_published = true AND (status = 'draft' OR status IS NULL);
    `);

    // 2. Thêm cột rejection_reason
    await db.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);

    // 3. Thêm cột submitted_at
    await db.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;
    `);

    // 4. Thêm cột published_at
    await db.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
      UPDATE posts SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;
    `);

    // 5. Thêm Indexes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
    `);

    console.log('✅ Phase 2 Database Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migratePhase2();
