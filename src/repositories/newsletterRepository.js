const db = require('../config/db');

class NewsletterRepository {
  // Tìm subscriber theo email
  async findByEmail(email) {
    const query = `SELECT * FROM newsletter_subscribers WHERE email = $1;`;
    const result = await db.query(query, [email.toLowerCase().trim()]);
    return result.rows[0] || null;
  }

  // Tìm subscriber theo token hủy đăng ký
  async findByUnsubscribeToken(token) {
    const query = `SELECT * FROM newsletter_subscribers WHERE unsubscribe_token = $1;`;
    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  }

  // Thêm subscriber mới
  async createSubscriber({ email, unsubscribe_token }) {
    const query = `
      INSERT INTO newsletter_subscribers (email, status, unsubscribe_token, subscribed_at)
      VALUES ($1, 'active', $2, NOW())
      RETURNING *;
    `;
    const result = await db.query(query, [email.toLowerCase().trim(), unsubscribe_token]);
    return result.rows[0];
  }

  // Kích hoạt lại email từng hủy
  async reactivateSubscriber(email) {
    const query = `
      UPDATE newsletter_subscribers
      SET status = 'active', unsubscribed_at = NULL, subscribed_at = NOW(), updated_at = NOW()
      WHERE email = $1
      RETURNING *;
    `;
    const result = await db.query(query, [email.toLowerCase().trim()]);
    return result.rows[0];
  }

  // Hủy đăng ký bằng token
  async unsubscribeByToken(token) {
    const query = `
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
      WHERE unsubscribe_token = $1
      RETURNING *;
    `;
    const result = await db.query(query, [token]);
    return result.rows[0] || null;
  }

  // Hủy đăng ký theo ID (Admin)
  async unsubscribeById(id) {
    const query = `
      UPDATE newsletter_subscribers
      SET status = 'unsubscribed', unsubscribed_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Xóa vĩnh viễn subscriber
  async deleteSubscriber(id) {
    const query = `DELETE FROM newsletter_subscribers WHERE id = $1 RETURNING id;`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  // Lấy toàn bộ subscribers active để gửi mail bài mới
  async getActiveSubscribers() {
    const query = `
      SELECT id, email, unsubscribe_token 
      FROM newsletter_subscribers 
      WHERE status = 'active'
      ORDER BY id ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // Thống kê tổng quan Subscriber & Chiến dịch
  async getStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*)::int FROM newsletter_subscribers) AS total_subscribers,
        (SELECT COUNT(*)::int FROM newsletter_subscribers WHERE status = 'active') AS active_subscribers,
        (SELECT COUNT(*)::int FROM newsletter_subscribers WHERE status = 'unsubscribed') AS unsubscribed_count,
        (SELECT COUNT(*)::int FROM newsletter_deliveries WHERE status = 'sent') AS total_sent_emails,
        (SELECT COUNT(DISTINCT post_id)::int FROM newsletter_deliveries) AS total_campaigns;
    `;
    const result = await db.query(query);
    return result.rows[0] || {
      total_subscribers: 0,
      active_subscribers: 0,
      unsubscribed_count: 0,
      total_sent_emails: 0,
      total_campaigns: 0,
    };
  }

  // Lấy danh sách subscribers cho Admin
  async findAllSubscribers({ status, search = '', limit = 10, offset = 0 } = {}) {
    let whereClauses = [];
    let values = [];
    let index = 1;

    if (status && status !== 'all') {
      whereClauses.push(`status = $${index++}`);
      values.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push(`email ILIKE $${index++}`);
      values.push(`%${search.trim()}%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `
      SELECT * FROM newsletter_subscribers
      ${whereString}
      ORDER BY subscribed_at DESC
      LIMIT $${index++} OFFSET $${index++};
    `;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  // Đếm tổng số subscribers theo bộ lọc
  async countSubscribers({ status, search = '' } = {}) {
    let whereClauses = [];
    let values = [];
    let index = 1;

    if (status && status !== 'all') {
      whereClauses.push(`status = $${index++}`);
      values.push(status);
    }

    if (search && search.trim()) {
      whereClauses.push(`email ILIKE $${index++}`);
      values.push(`%${search.trim()}%`);
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const query = `SELECT COUNT(*)::int AS count FROM newsletter_subscribers ${whereString};`;

    const result = await db.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }

  // Kiểm tra lịch sử gửi để chống duplicate email
  async findDelivery(postId, subscriberId) {
    const query = `
      SELECT * FROM newsletter_deliveries
      WHERE post_id = $1 AND subscriber_id = $2;
    `;
    const result = await db.query(query, [postId, subscriberId]);
    return result.rows[0] || null;
  }

  // Ghi nhận trạng thái gửi email
  async recordDelivery({ postId, subscriberId, status, errorMessage = null }) {
    const query = `
      INSERT INTO newsletter_deliveries (post_id, subscriber_id, status, error_message, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (post_id, subscriber_id)
      DO UPDATE SET status = $3, error_message = $4, attempts = newsletter_deliveries.attempts + 1, sent_at = NOW()
      RETURNING *;
    `;
    const result = await db.query(query, [postId, subscriberId, status, errorMessage]);
    return result.rows[0];
  }

  // Lấy lịch sử gửi theo bài viết
  async getDeliveriesHistory({ limit = 10, offset = 0 } = {}) {
    const query = `
      SELECT 
        p.id AS post_id, p.title AS post_title, p.slug AS post_slug, p.published_at,
        c.name AS category_name,
        COUNT(d.id)::int AS total_recipients,
        COUNT(CASE WHEN d.status = 'sent' THEN 1 END)::int AS sent_count,
        COUNT(CASE WHEN d.status = 'failed' THEN 1 END)::int AS failed_count,
        MAX(d.sent_at) AS last_sent_at
      FROM newsletter_deliveries d
      JOIN posts p ON d.post_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      GROUP BY p.id, p.title, p.slug, p.published_at, c.name
      ORDER BY last_sent_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }
}

module.exports = new NewsletterRepository();
