const db = require('../config/db');

class PostRepository {
  async findAll({
    limit = 10,
    offset = 0,
    category_id,
    category,
    search,
    status,
    author_id,
    sort = 'newest',
    date_from,
    date_to,
  }) {
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, u.username as author_name,
             COUNT(cm.id)::int as comments_count
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      WHERE 1=1
    `;
    const params = [];

    const targetCategory = category || category_id;
    if (targetCategory) {
      if (/^\d+$/.test(String(targetCategory))) {
        params.push(targetCategory);
        query += ` AND p.category_id = $${params.length}`;
      } else {
        params.push(targetCategory);
        query += ` AND c.slug = $${params.length}`;
      }
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    if (author_id) {
      params.push(author_id);
      query += ` AND p.author_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`;
    }

    if (date_from) {
      const fromVal = date_from.length === 10 ? `${date_from} 00:00:00` : date_from;
      params.push(fromVal);
      query += ` AND COALESCE(p.published_at, p.created_at) >= $${params.length}::timestamptz`;
    }

    if (date_to) {
      const toVal = date_to.length === 10 ? `${date_to} 23:59:59.999` : date_to;
      params.push(toVal);
      query += ` AND COALESCE(p.published_at, p.created_at) <= $${params.length}::timestamptz`;
    }

    query += ` GROUP BY p.id, c.name, c.slug, u.username`;

    switch (sort) {
      case 'oldest':
        query += ` ORDER BY COALESCE(p.published_at, p.created_at) ASC, p.id ASC`;
        break;
      case 'views_desc':
        query += ` ORDER BY p.views_count DESC, p.id DESC`;
        break;
      case 'comments_desc':
        query += ` ORDER BY comments_count DESC, p.id DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY COALESCE(p.published_at, p.created_at) DESC, p.id DESC`;
        break;
    }

    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  }

  async countAll({ category_id, category, search, status, author_id, date_from, date_to }) {
    let query = 'SELECT COUNT(*) FROM posts p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];

    const targetCategory = category || category_id;
    if (targetCategory) {
      if (/^\d+$/.test(String(targetCategory))) {
        params.push(targetCategory);
        query += ` AND p.category_id = $${params.length}`;
      } else {
        params.push(targetCategory);
        query += ` AND c.slug = $${params.length}`;
      }
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    if (author_id) {
      params.push(author_id);
      query += ` AND p.author_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`;
    }

    if (date_from) {
      const fromVal = date_from.length === 10 ? `${date_from} 00:00:00` : date_from;
      params.push(fromVal);
      query += ` AND COALESCE(p.published_at, p.created_at) >= $${params.length}::timestamptz`;
    }

    if (date_to) {
      const toVal = date_to.length === 10 ? `${date_to} 23:59:59.999` : date_to;
      params.push(toVal);
      query += ` AND COALESCE(p.published_at, p.created_at) <= $${params.length}::timestamptz`;
    }

    const result = await db.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async getStats(author_id = null) {
    let query = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'published' THEN 1 END)::int as published,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected,
        COUNT(CASE WHEN status = 'draft' THEN 1 END)::int as draft
      FROM posts
      WHERE 1=1
    `;
    const params = [];
    if (author_id) {
      params.push(author_id);
      query += ` AND author_id = $1`;
    }
    const result = await db.query(query, params);
    return result.rows[0];
  }

  async findById(id) {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, u.username as author_name,
             COUNT(cm.id)::int as comments_count
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      WHERE p.id = $1
      GROUP BY p.id, c.name, c.slug, u.username
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async findBySlug(slug) {
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, u.username as author_name
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
    `;
    const result = await db.query(query, [slug]);
    return result.rows[0];
  }

  async create({
    title,
    slug,
    summary,
    content,
    thumbnail,
    category_id,
    author_id,
    is_published = false,
    status = 'draft',
    rejection_reason = null,
    submitted_at = null,
    published_at = null,
  }) {
    const isPub = status === 'published' || is_published;
    const pubAt = isPub ? (published_at || new Date()) : null;
    const query = `
      INSERT INTO posts (title, slug, summary, content, thumbnail, category_id, author_id, is_published, status, rejection_reason, submitted_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [title, slug, summary, content, thumbnail, category_id, author_id, isPub, status, rejection_reason, submitted_at, pubAt];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async update(id, {
    title,
    slug,
    summary,
    content,
    thumbnail,
    category_id,
    is_published,
    status,
    rejection_reason,
    submitted_at,
    published_at,
  }) {
    const query = `
      UPDATE posts
      SET title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          summary = COALESCE($3, summary),
          content = COALESCE($4, content),
          thumbnail = COALESCE($5, thumbnail),
          category_id = COALESCE($6, category_id),
          is_published = COALESCE($7, is_published),
          status = COALESCE($8, status),
          rejection_reason = COALESCE($9, rejection_reason),
          submitted_at = COALESCE($10, submitted_at),
          published_at = COALESCE($11, published_at),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `;
    const values = [title, slug, summary, content, thumbnail, category_id, is_published, status, rejection_reason, submitted_at, published_at, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Cập nhật trạng thái duyệt bài viết
  async updateStatus(id, { status, rejection_reason = null, published_at = null, submitted_at = null }) {
    const is_published = status === 'published';
    const sets = [
      'status = $1',
      'rejection_reason = $2',
      'is_published = $3',
      'updated_at = CURRENT_TIMESTAMP',
    ];
    const values = [status, rejection_reason, is_published];

    if (status === 'published') {
      values.push(published_at || new Date());
      sets.push(`published_at = COALESCE(published_at, $${values.length})`);
    } else if (status === 'pending') {
      values.push(submitted_at || new Date());
      sets.push(`submitted_at = COALESCE(submitted_at, $${values.length})`);
    }

    values.push(id);
    const query = `
      UPDATE posts
      SET ${sets.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async incrementViews(id) {
    const query = 'UPDATE posts SET views_count = views_count + 1 WHERE id = $1';
    await db.query(query, [id]);
  }

  async delete(id) {
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Lấy các bài viết mới nhất phục vụ Dashboard
  async getRecentPosts(limit = 6) {
    const query = `
      SELECT p.id, p.title, p.slug, p.thumbnail, p.views_count, p.likes_count, p.shares_count, p.created_at,
             p.status, p.is_published, p.rejection_reason,
             c.name as category_name, u.username as author_name,
             COUNT(cm.id)::int as comments_count
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      GROUP BY p.id, c.name, u.username
      ORDER BY p.id DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  async likePost(id, userId = null) {
    if (userId) {
      const check = await db.query('SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
      if (check.rows.length > 0) {
        await db.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [id, userId]);
        const res = await db.query('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1 RETURNING likes_count', [id]);
        return { liked: false, likes_count: res.rows[0]?.likes_count || 0 };
      } else {
        await db.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [id, userId]);
        const res = await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count', [id]);
        return { liked: true, likes_count: res.rows[0]?.likes_count || 0 };
      }
    } else {
      const res = await db.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count', [id]);
      return { liked: true, likes_count: res.rows[0]?.likes_count || 0 };
    }
  }

  async sharePost(id) {
    const res = await db.query('UPDATE posts SET shares_count = shares_count + 1 WHERE id = $1 RETURNING shares_count', [id]);
    return { shares_count: res.rows[0]?.shares_count || 0 };
  }
}

module.exports = new PostRepository();
