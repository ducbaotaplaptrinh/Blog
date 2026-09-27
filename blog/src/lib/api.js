const BACKEND_INTERNAL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000/api';
const BACKEND_PUBLIC = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Lấy danh sách bài viết đã xuất bản (Published Posts)
 * Dùng Native Fetch với ISR revalidation 60 giây
 */
export async function getPublishedPosts({
  page = 1,
  limit = 9,
  category,
  category_id,
  search,
  sort,
  date_from,
  date_to,
} = {}) {
  try {
    const params = new URLSearchParams({
      status: 'published',
      page: String(page),
      limit: String(limit),
    });

    if (category) params.append('category', String(category));
    if (category_id) params.append('category_id', String(category_id));
    if (search && search.trim()) params.append('search', search.trim());
    if (sort) params.append('sort', String(sort));
    if (date_from) params.append('date_from', String(date_from));
    if (date_to) params.append('date_to', String(date_to));

    const res = await fetch(`${BACKEND_INTERNAL}/posts?${params.toString()}`, {
      next: { revalidate: 60, tags: ['posts'] },
    });

    if (!res.ok) {
      return { data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } };
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? json.data : (json.data?.posts || []);
    const pagination = json.pagination || json.data?.pagination || {
      total: data.length,
      page,
      limit,
      totalPages: Math.ceil(data.length / limit) || 1,
    };

    return { data, pagination, total: pagination.total };
  } catch (err) {
    console.error('[API] getPublishedPosts error:', err);
    return { data: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } };
  }
}

/**
 * Lấy Top bài viết xem nhiều nhất (Phục vụ sidebar / hero)
 */
export async function getTopPopularPosts(limit = 5) {
  try {
    const res = await fetch(`${BACKEND_INTERNAL}/posts/popular?limit=${limit}`, {
      next: { revalidate: 60, tags: ['top-popular'] },
    });

    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : (json.data?.posts || []);
      if (list.length > 0) return { data: list };
    }

    // Fallback: Lấy danh sách bài viết đã xuất bản sắp xếp giảm dần theo lượt xem (views_desc)
    const fallbackRes = await getPublishedPosts({ limit, page: 1, sort: 'views_desc' });
    return { data: fallbackRes.data || [] };
  } catch (err) {
    console.warn('[API] getTopPopularPosts error:', err);
    return { data: [] };
  }
}

/**
 * Lấy chi tiết bài viết theo Slug
 */
export async function getPostBySlug(slug) {
  try {
    const res = await fetch(`${BACKEND_INTERNAL}/posts/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [`post-${slug}`] },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const post = json.data?.post || json.data;
    return post ? { data: post } : null;
  } catch (err) {
    console.error(`[API] getPostBySlug (${slug}) error:`, err);
    return null;
  }
}

/**
 * Lấy danh sách toàn bộ danh mục
 */
export async function getCategories() {
  try {
    const res = await fetch(`${BACKEND_INTERNAL}/categories`, {
      next: { revalidate: 120, tags: ['categories'] },
    });

    if (!res.ok) return { data: [] };
    const json = await res.json();
    const categories = Array.isArray(json.data) ? json.data : (json.data?.categories || []);
    return { data: categories };
  } catch (err) {
    console.error('[API] getCategories error:', err);
    return { data: [] };
  }
}

/**
 * Lấy thông tin một danh mục theo Slug
 */
export async function getCategoryBySlug(slug) {
  try {
    const res = await fetch(`${BACKEND_INTERNAL}/categories/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 120, tags: [`category-${slug}`] },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const category = json.data?.category || json.data;
    return category ? { data: category } : null;
  } catch (err) {
    console.error(`[API] getCategoryBySlug (${slug}) error:`, err);
    return null;
  }
}

/**
 * Lấy danh sách bình luận của bài viết
 */
export async function getCommentsByPostId(postId) {
  try {
    const res = await fetch(`${BACKEND_INTERNAL}/comments/post/${postId}`, {
      cache: 'no-store',
    });

    if (!res.ok) return { data: [] };
    const json = await res.json();
    const comments = Array.isArray(json.data) ? json.data : (json.data?.comments || []);
    return { data: comments };
  } catch (err) {
    console.error(`[API] getCommentsByPostId (${postId}) error:`, err);
    return { data: [] };
  }
}

/**
 * Gửi bình luận mới từ Client (Hỗ trợ cả độc giả vãng lai và thành viên)
 */
export async function postComment({ post_id, content, parent_id = null, guest_name, guest_email }) {
  const res = await fetch(`${BACKEND_PUBLIC}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post_id,
      content,
      parent_id,
      guest_name,
      guest_email,
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gửi bình luận thất bại');
  }
  return json;
}
export const submitComment = postComment;

/**
 * Tương tác Thích bài viết
 */
export async function likePost(postId) {
  const res = await fetch(`${BACKEND_PUBLIC}/posts/${postId}/like`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Không thể thả tim bài viết');
  return res.json();
}
export const toggleLikePost = likePost;

/**
 * Ghi nhận Chia sẻ bài viết
 */
export async function trackSharePost(postId) {
  try {
    const res = await fetch(`${BACKEND_PUBLIC}/posts/${postId}/share`, {
      method: 'POST',
    });
    return res.json();
  } catch (e) {
    return { success: false };
  }
}

/**
 * Ghi nhận độ sâu đọc bài viết (Read Depth Milestone: 25, 50, 75, 100)
 */
export async function trackReadDepth(postId, depth) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({ post_id: postId, depth });
  const url = `${BACKEND_PUBLIC}/analytics/read-depth`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}
export const recordScrollDepthBeacon = trackReadDepth;
