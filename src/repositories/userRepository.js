const db = require('../config/db');

class UserRepository {
  // Tìm user theo email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Tìm user theo username
  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
  }

  // Tìm user theo ID (không lấy password_hash)
  async findById(id) {
    const query = 'SELECT id, username, email, role, avatar, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Tạo user mới
  async create({ username, email, password_hash, role = 'user' }) {
    const query = `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `;
    const values = [username, email, password_hash, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }
  // Lấy tất cả user kèm số lượng comment (không lộ password_hash)
  async findAllWithStats() {
    const query = `
      SELECT u.id, u.username, u.email, u.role, u.avatar, u.created_at,
             COUNT(c.id)::int AS comment_count
      FROM users u
      LEFT JOIN comments c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY u.id DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Đếm tổng số user
  async countAll() {
    const query = 'SELECT COUNT(*) FROM users';
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  // Lấy danh sách user mới nhất cho Dashboard
  async getRecentUsers(limit = 5) {
    const query = `
      SELECT id, username, email, role, avatar, created_at
      FROM users
      ORDER BY id DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // Cập nhật vai trò (Role) của user
  async updateRole(id, role) {
    const query = `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, username, email, role, created_at
    `;
    const result = await db.query(query, [role, id]);
    return result.rows[0];
  }

  // Tìm user theo ID bao gồm password_hash để xác thực mật khẩu
  async findByIdWithPassword(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Cập nhật mật khẩu mới đã băm
  async updatePassword(id, password_hash) {
    const query = `
      UPDATE users
      SET password_hash = $1
      WHERE id = $2
      RETURNING id, username, email, role, created_at
    `;
    const result = await db.query(query, [password_hash, id]);
    return result.rows[0];
  }
}

module.exports = new UserRepository();
