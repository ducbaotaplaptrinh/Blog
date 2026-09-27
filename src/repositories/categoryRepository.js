const db = require('../config/db');

class CategoryRepository {
  async findAll() {
    const query = 'SELECT * FROM categories ORDER BY id DESC';
    const result = await db.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async findBySlug(slug) {
    const query = 'SELECT * FROM categories WHERE slug = $1';
    const result = await db.query(query, [slug]);
    return result.rows[0];
  }

  async create({ name, slug, description }) {
    const query = `
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [name, slug, description]);
    return result.rows[0];
  }

  async update(id, { name, slug, description }) {
    const query = `
      UPDATE categories
      SET name = $1, slug = $2, description = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await db.query(query, [name, slug, description, id]);
    return result.rows[0];
  }

  async delete(id) {
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async countAll() {
    const query = 'SELECT COUNT(*) FROM categories';
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = new CategoryRepository();
