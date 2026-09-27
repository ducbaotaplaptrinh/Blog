const db = require('../config/db');

class AnalyticsRepository {
  // 1. Top bài viết xem nhiều nhất (Popular posts) kèm Read Depth Metrics
  async getTopPopularPosts(limit = 10) {
    const query = `
      SELECT p.id, p.title, p.slug, p.thumbnail, p.views_count, p.likes_count, p.shares_count, p.created_at, p.published_at,
             c.name as category_name, u.username as author_name,
             COUNT(DISTINCT cm.id)::int as comments_count,
             rd.total_sessions, rd.reached_25, rd.reached_50, rd.reached_75, rd.reached_100,
             ROUND(
               CASE 
                 WHEN COALESCE(rd.total_sessions, 0) > 0 
                 THEN (COALESCE(rd.reached_100, 0)::numeric / rd.total_sessions) * 100 
                 ELSE 0 
               END, 1
             )::float as completion_rate
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      LEFT JOIN post_read_depth rd ON p.id = rd.post_id
      WHERE p.status = 'published' OR p.is_published = true
      GROUP BY p.id, c.name, u.username, rd.total_sessions, rd.reached_25, rd.reached_50, rd.reached_75, rd.reached_100, p.likes_count, p.shares_count
      ORDER BY p.views_count DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // 2. Bài viết có tương tác thảo luận cao nhất (Most engaged posts by comments)
  async getTopEngagementPosts(limit = 10) {
    const query = `
      SELECT p.id, p.title, p.slug, p.thumbnail, p.views_count, p.created_at, p.published_at,
             c.name as category_name, u.username as author_name,
             COUNT(DISTINCT cm.id)::int as comments_count,
             rd.total_sessions, rd.reached_100,
             ROUND(
               CASE 
                 WHEN COALESCE(rd.total_sessions, 0) > 0 
                 THEN (COALESCE(rd.reached_100, 0)::numeric / rd.total_sessions) * 100 
                 ELSE 0 
               END, 1
             )::float as completion_rate
      FROM posts p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      LEFT JOIN post_read_depth rd ON p.id = rd.post_id
      WHERE p.status = 'published' OR p.is_published = true
      GROUP BY p.id, c.name, u.username, rd.total_sessions, rd.reached_100
      ORDER BY comments_count DESC, p.views_count DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // 3. Phân tích hiệu suất theo danh mục (Categories breakdown)
  async getCategoriesBreakdown() {
    const query = `
      SELECT c.id, c.name, c.slug,
             COUNT(DISTINCT p.id)::int as total_posts,
             COALESCE(SUM(p.views_count), 0)::bigint as total_views,
             COUNT(DISTINCT cm.id)::int as total_comments
      FROM categories c
      LEFT JOIN posts p ON c.id = p.category_id AND (p.status = 'published' OR p.is_published = true)
      LEFT JOIN comments cm ON p.id = cm.post_id
      GROUP BY c.id, c.name, c.slug
      ORDER BY total_views DESC, total_posts DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // 4. Tổng quan chỉ số Content Analytics
  async getAnalyticsSummary() {
    const query = `
      SELECT 
        (SELECT COUNT(*)::int FROM posts WHERE status = 'published' OR is_published = true) as published_posts_count,
        (SELECT COALESCE(SUM(views_count), 0)::bigint FROM posts) as total_views,
        (SELECT COALESCE(SUM(likes_count), 0)::bigint FROM posts) as total_likes,
        (SELECT COALESCE(SUM(shares_count), 0)::bigint FROM posts) as total_shares,
        (SELECT COUNT(*)::int FROM comments) as total_comments,
        (SELECT COUNT(*)::int FROM users) as total_users,
        (SELECT COALESCE(SUM(total_sessions), 0)::bigint FROM post_read_depth) as total_read_sessions,
        (SELECT COALESCE(SUM(reached_100), 0)::bigint FROM post_read_depth) as total_completed_reads,
        ROUND(
          CASE 
            WHEN (SELECT COALESCE(SUM(total_sessions), 0) FROM post_read_depth) > 0 
            THEN ((SELECT COALESCE(SUM(reached_100), 0)::numeric FROM post_read_depth) / (SELECT SUM(total_sessions) FROM post_read_depth)) * 100 
            ELSE 0 
          END, 1
        )::float as avg_completion_rate
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // 5. Ghi nhận Scroll / Read Depth Milestone từ phía độc giả
  async recordReadDepth({ postId, milestone, isNewSession }) {
    // Đảm bảo có record
    await db.query(`
      INSERT INTO post_read_depth (post_id, total_sessions, reached_25, reached_50, reached_75, reached_100)
      VALUES ($1, 0, 0, 0, 0, 0)
      ON CONFLICT (post_id) DO NOTHING
    `, [postId]);

    if (isNewSession) {
      await db.query(`
        UPDATE post_read_depth
        SET total_sessions = total_sessions + 1, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $1
      `, [postId]);
    }

    if ([25, 50, 75, 100].includes(Number(milestone))) {
      const col = `reached_${milestone}`;
      await db.query(`
        UPDATE post_read_depth
        SET ${col} = ${col} + 1, updated_at = CURRENT_TIMESTAMP
        WHERE post_id = $1
      `, [postId]);
    }

    return this.getReadDepthByPostId(postId);
  }

  // 6. Chi tiết Read Depth của 1 bài viết
  async getReadDepthByPostId(postId) {
    const query = `
      SELECT p.id as post_id, p.title, p.slug, p.views_count,
             COALESCE(rd.total_sessions, 0) as total_sessions,
             COALESCE(rd.reached_25, 0) as reached_25,
             COALESCE(rd.reached_50, 0) as reached_50,
             COALESCE(rd.reached_75, 0) as reached_75,
             COALESCE(rd.reached_100, 0) as reached_100,
             ROUND(CASE WHEN COALESCE(rd.total_sessions, 0) > 0 THEN (rd.reached_25::numeric / rd.total_sessions) * 100 ELSE 0 END, 1)::float as rate_25,
             ROUND(CASE WHEN COALESCE(rd.total_sessions, 0) > 0 THEN (rd.reached_50::numeric / rd.total_sessions) * 100 ELSE 0 END, 1)::float as rate_50,
             ROUND(CASE WHEN COALESCE(rd.total_sessions, 0) > 0 THEN (rd.reached_75::numeric / rd.total_sessions) * 100 ELSE 0 END, 1)::float as rate_75,
             ROUND(CASE WHEN COALESCE(rd.total_sessions, 0) > 0 THEN (rd.reached_100::numeric / rd.total_sessions) * 100 ELSE 0 END, 1)::float as rate_100
      FROM posts p
      LEFT JOIN post_read_depth rd ON p.id = rd.post_id
      WHERE p.id = $1
    `;
    const result = await db.query(query, [postId]);
    return result.rows[0];
  }
}

module.exports = new AnalyticsRepository();
