const db = require('../config/db');

class CommentRepository {
  // 1. Thống kê KPI tổng quan bình luận cho Admin
  async getStats() {
    const query = `
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending,
        COUNT(CASE WHEN status = 'approved' OR status IS NULL THEN 1 END)::int AS approved,
        COUNT(CASE WHEN status = 'hidden' THEN 1 END)::int AS hidden,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::int AS today_count
      FROM comments;
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // 2. Lấy danh sách bình luận chờ xử lý (Pending / Hidden) cho Action Queue
  async findPendingComments({ limit = 20, offset = 0 } = {}) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role,
             p.title AS post_title, p.slug AS post_slug
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.status IN ('pending', 'hidden')
      ORDER BY (CASE WHEN c.status = 'pending' THEN 1 ELSE 2 END) ASC, c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  // 3. Đếm số lượng bình luận chờ xử lý
  async countPendingComments() {
    const query = `SELECT COUNT(*)::int FROM comments WHERE status IN ('pending', 'hidden')`;
    const result = await db.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  // 4. Lấy danh sách bài viết gom nhóm theo tương tác bình luận (Group by Post)
  async findPostCommentGroups({ limit = 15, offset = 0, search = '' } = {}) {
    const query = `
      SELECT p.id AS post_id, p.title AS post_title, p.slug AS post_slug, p.thumbnail,
             c_cat.name AS category_name, u.username AS author_name,
             COUNT(cm.id)::int AS total_comments,
             COUNT(CASE WHEN cm.status = 'pending' THEN 1 END)::int AS pending_comments,
             COUNT(CASE WHEN cm.status = 'approved' OR cm.status IS NULL THEN 1 END)::int AS approved_comments,
             COUNT(CASE WHEN cm.status = 'hidden' THEN 1 END)::int AS hidden_comments,
             MAX(cm.created_at) AS last_comment_at
      FROM posts p
      INNER JOIN comments cm ON p.id = cm.post_id
      LEFT JOIN categories c_cat ON p.category_id = c_cat.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE ($1 = '' OR p.title ILIKE '%' || $1 || '%')
      GROUP BY p.id, c_cat.name, u.username
      ORDER BY pending_comments DESC, last_comment_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [search || '', limit, offset]);
    return result.rows;
  }

  // 5. Đếm số lượng bài viết có bình luận
  async countPostCommentGroups({ search = '' } = {}) {
    const query = `
      SELECT COUNT(DISTINCT p.id)::int
      FROM posts p
      INNER JOIN comments cm ON p.id = cm.post_id
      WHERE ($1 = '' OR p.title ILIKE '%' || $1 || '%')
    `;
    const result = await db.query(query, [search || '']);
    return parseInt(result.rows[0].count, 10);
  }

  // 6. Lấy toàn bộ cây bình luận của một bài viết cho Admin (bao gồm cả pending, approved, hidden)
  async findAdminByPostId(postId) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role,
             parent_u.username AS reply_to_username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN comments parent_c ON c.parent_id = parent_c.id
      LEFT JOIN users parent_u ON parent_c.user_id = parent_u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await db.query(query, [postId]);
    return result.rows;
  }

  // 7. Cập nhật trạng thái duyệt bình luận ('approved', 'hidden', 'pending')
  async updateStatus(id, status) {
    const query = `
      UPDATE comments
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }

  // 8. Lấy danh sách tất cả bình luận có bộ lọc & phân trang
  async findAll({ limit = 50, offset = 0, status, search, post_id, user_id } = {}) {
    let query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role,
             p.title AS post_title, p.slug AS post_slug
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    if (post_id) {
      params.push(post_id);
      query += ` AND c.post_id = $${params.length}`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND c.user_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.content ILIKE $${params.length} OR u.username ILIKE $${params.length} OR p.title ILIKE $${params.length})`;
    }

    query += ` ORDER BY c.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  // 9. Đếm tổng số bình luận theo bộ lọc
  async countAll({ status, search, post_id, user_id } = {}) {
    let query = `
      SELECT COUNT(*)::int
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }

    if (post_id) {
      params.push(post_id);
      query += ` AND c.post_id = $${params.length}`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND c.user_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.content ILIKE $${params.length} OR u.username ILIKE $${params.length} OR p.title ILIKE $${params.length})`;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  // 10. Lấy chi tiết comment theo ID
  async findById(id) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role,
             p.title AS post_title, p.slug AS post_slug
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // 11. Lấy bình luận đã duyệt của bài viết (Cho Public Blog)
  async findByPostId(postId) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1 AND (c.status = 'approved' OR c.status IS NULL)
      ORDER BY c.created_at ASC
    `;
    const result = await db.query(query, [postId]);
    return result.rows;
  }

  // 12. Lấy bình luận của 1 user
  async findByUserId(userId) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             p.title AS post_title, p.slug AS post_slug
      FROM comments c
      LEFT JOIN posts p ON c.post_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // 13. Lấy bình luận mới nhất cho Dashboard
  async getRecentComments(limit = 5) {
    const query = `
      SELECT c.id, c.content, c.created_at, c.post_id, c.user_id, c.parent_id, c.status,
             u.username, u.email, u.avatar, u.role,
             p.title AS post_title, p.slug AS post_slug
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN posts p ON c.post_id = p.id
      ORDER BY c.id DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // 14. Tạo bình luận mới (Mặc định là 'pending' để Ban Biên tập kiểm duyệt)
  async create({ post_id, user_id, content, parent_id = null, status = 'pending' }) {
    const query = `
      INSERT INTO comments (post_id, user_id, content, parent_id, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [post_id, user_id, content, parent_id || null, status]);
    return result.rows[0];
  }

  // 15. Xóa bình luận
  async delete(id) {
    const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new CommentRepository();
