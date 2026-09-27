const db = require('../config/db');

class ContactRepository {
  // Tạo liên hệ mới từ độc giả
  async create({ name, email, subject_type = 'feedback', title = '', message }) {
    const query = `
      INSERT INTO contacts (name, email, subject_type, title, message, status)
      VALUES ($1, $2, $3, $4, $5, 'new')
      RETURNING *;
    `;
    const result = await db.query(query, [name, email, subject_type, title, message]);
    return result.rows[0];
  }

  // Thống kê KPI hòm thư liên hệ
  async getStats() {
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'new' THEN 1 END)::int AS new,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int AS in_progress,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved,
        COUNT(CASE WHEN status = 'spam' THEN 1 END)::int AS spam
      FROM contacts;
    `;
    const result = await db.query(query);
    return result.rows[0] || { total: 0, new: 0, in_progress: 0, resolved: 0, spam: 0 };
  }

  // Lấy danh sách liên hệ (có lọc status, search, phân trang)
  async findAll({ status, search = '', limit = 10, offset = 0 } = {}) {
    let whereClauses = [];
    let values = [];
    let index = 1;

    if (status && status !== 'all') {
      whereClauses.push(`c.status = $${index++}`);
      values.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push(`(c.name ILIKE $${index} OR c.email ILIKE $${index} OR c.title ILIKE $${index} OR c.message ILIKE $${index})`);
      values.push(`%${search.trim()}%`);
      index++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT c.*, u.username AS assigned_username
      FROM contacts c
      LEFT JOIN users u ON c.assigned_to = u.id
      ${whereString}
      ORDER BY 
        (CASE WHEN c.status = 'new' THEN 1 WHEN c.status = 'in_progress' THEN 2 ELSE 3 END) ASC,
        c.created_at DESC
      LIMIT $${index++} OFFSET $${index++};
    `;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  // Đếm tổng số bản ghi phù hợp bộ lọc
  async countAll({ status, search = '' } = {}) {
    let whereClauses = [];
    let values = [];
    let index = 1;

    if (status && status !== 'all') {
      whereClauses.push(`status = $${index++}`);
      values.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push(`(name ILIKE $${index} OR email ILIKE $${index} OR title ILIKE $${index} OR message ILIKE $${index})`);
      values.push(`%${search.trim()}%`);
      index++;
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `SELECT COUNT(*)::int AS count FROM contacts ${whereString};`;

    const result = await db.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  // Lấy chi tiết liên hệ theo ID
  async findById(id) {
    const query = `
      SELECT c.*, u.username AS assigned_username, u.email AS assigned_email
      FROM contacts c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Cập nhật trạng thái xử lý
  async updateStatus(id, { status, admin_notes, assigned_to }) {
    const query = `
      UPDATE contacts
      SET 
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        assigned_to = COALESCE($3, assigned_to),
        resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *;
    `;
    const result = await db.query(query, [status, admin_notes, assigned_to, id]);
    return result.rows[0] || null;
  }

  // Xóa liên hệ (chỉ dành cho Super Admin)
  async delete(id) {
    const query = `DELETE FROM contacts WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new ContactRepository();
