const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDatabase() {
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('⏳ Running database initialization script...');
    await db.query(sql);
    console.log('✅ Database tables & indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    process.exit(1);
  }
}

initDatabase();
