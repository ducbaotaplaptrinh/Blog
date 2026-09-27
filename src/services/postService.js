const postRepository = require('../repositories/postRepository');
const slugify = require('../utils/slugify');
const newsletterService = require('./newsletterService');

class PostService {
  async getAllPosts({
    page = 1,
    limit = 10,
    category_id,
    category,
    search,
    status,
    author_id,
    sort = 'newest',
    date_from,
    date_to,
  }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    const posts = await postRepository.findAll({
      limit: limitNum,
      offset,
      category_id,
      category,
      search,
      status,
      author_id,
      sort,
      date_from,
      date_to,
    });
    const total = await postRepository.countAll({
      category_id,
      category,
      search,
      status,
      author_id,
      date_from,
      date_to,
    });

    return {
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async getPopularPosts(limit = 5) {
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50);
    const posts = await postRepository.findAll({
      limit: limitNum,
      offset: 0,
      status: 'published',
      sort: 'views_desc',
    });
    return posts;
  }

  async getStats(author_id = null) {
    return await postRepository.getStats(author_id);
  }

  async getPostBySlug(slug, user = null) {
    const post = await postRepository.findBySlug(slug);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    const isStaff = user && ['super_admin', 'admin', 'editor', 'author'].includes(user.role);
    if (!isStaff && post.status !== 'published') {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    await postRepository.incrementViews(post.id);
    return post;
  }

  async getPostById(id) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
    return post;
  }

  async createPost({ title, summary, content, thumbnail, category_id, author_id, status = 'draft', user }) {
    if (!title || !content) {
      const error = new Error('Tiêu đề và nội dung bài viết không được để trống');
      error.statusCode = 400;
      throw error;
    }

    let slug = slugify(title);
    const existingPost = await postRepository.findBySlug(slug);
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const isStaff = user && (user.role === 'super_admin' || user.role === 'admin' || user.role === 'editor');
    // Author tạo bài luôn ở trạng thái draft hoặc pending nếu bấm submit
    const initialStatus = isStaff ? (status || 'draft') : (status === 'pending' ? 'pending' : 'draft');
    const is_published = initialStatus === 'published';

    const createdPost = await postRepository.create({
      title,
      slug,
      summary,
      content,
      thumbnail,
      category_id: category_id || null,
      author_id,
      status: initialStatus,
      is_published,
      submitted_at: initialStatus === 'pending' ? new Date() : null,
      published_at: initialStatus === 'published' ? new Date() : null,
    });

    if (createdPost.status === 'published') {
      newsletterService.triggerPostPublished(createdPost);
    }

    return createdPost;
  }

  async updatePost(id, { title, summary, content, thumbnail, category_id, status, user }) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = post.status;
    const isSuperAdmin = user.role === 'super_admin' || user.role === 'admin';
    const isEditor = user.role === 'editor';
    const isStaffEditor = isSuperAdmin || isEditor;

    // Kiểm tra quyền chỉnh sửa
    if (!isStaffEditor) {
      // Author chỉ được sửa bài của chính mình
      if (post.author_id !== user.id) {
        const error = new Error('Bạn không có quyền chỉnh sửa bài viết của tác giả khác.');
        error.statusCode = 403;
        throw error;
      }

      // Khóa chỉnh sửa nếu bài đang pending hoặc đã published
      if (post.status === 'pending') {
        const error = new Error('Bài viết đang trong quá trình xét duyệt, không thể chỉnh sửa.');
        error.statusCode = 400;
        throw error;
      }
      if (post.status === 'published') {
        const error = new Error('Bài viết đã xuất bản. Vui lòng liên hệ Ban biên tập để cập nhật.');
        error.statusCode = 400;
        throw error;
      }
    }

    let slug = post.slug;
    if (title && title !== post.title) {
      slug = slugify(title);
      const existingPost = await postRepository.findBySlug(slug);
      if (existingPost && existingPost.id !== post.id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updatedPost = await postRepository.update(id, {
      title: title || post.title,
      slug,
      summary: summary !== undefined ? summary : post.summary,
      content: content || post.content,
      thumbnail: thumbnail !== undefined ? thumbnail : post.thumbnail,
      category_id: category_id !== undefined ? category_id : post.category_id,
      status: isStaffEditor && status ? status : post.status,
    });

    if (updatedPost.status === 'published' && previousStatus !== 'published') {
      newsletterService.triggerPostPublished(updatedPost);
    }

    return updatedPost;
  }

  async deletePost(id, user) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const isSuperAdmin = user.role === 'super_admin' || user.role === 'admin';
    const isEditor = user.role === 'editor';

    if (!isSuperAdmin && !isEditor) {
      if (post.author_id !== user.id) {
        const error = new Error('Bạn không có quyền xóa bài viết của tác giả khác.');
        error.statusCode = 403;
        throw error;
      }
      if (post.status !== 'draft') {
        const error = new Error('Tác giả chỉ được phép xóa bài viết ở trạng thái Bản nháp (Draft).');
        error.statusCode = 400;
        throw error;
      }
    }

    return await postRepository.delete(id);
  }

  // Tác giả gửi duyệt bài viết: DRAFT/REJECTED -> PENDING
  async submitPost(id, user) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const isSuperAdmin = user.role === 'super_admin' || user.role === 'admin';
    if (!isSuperAdmin && post.author_id !== user.id) {
      const error = new Error('Bạn chỉ có thể gửi duyệt bài viết của chính mình.');
      error.statusCode = 403;
      throw error;
    }

    if (post.status !== 'draft' && post.status !== 'rejected') {
      const error = new Error(`Bài viết đang ở trạng thái "${post.status}", không thể gửi duyệt.`);
      error.statusCode = 400;
      throw error;
    }

    return await postRepository.updateStatus(id, {
      status: 'pending',
      submitted_at: new Date(),
      rejection_reason: null,
    });
  }

  // Phê duyệt bài viết: PENDING -> PUBLISHED
  async approvePost(id, user) {
    const isStaffEditor = user.role === 'super_admin' || user.role === 'admin' || user.role === 'editor';
    if (!isStaffEditor) {
      const error = new Error('Chỉ Editor hoặc Super Admin mới có quyền phê duyệt bài viết.');
      error.statusCode = 403;
      throw error;
    }

    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const updatedPost = await postRepository.updateStatus(id, {
      status: 'published',
      published_at: new Date(),
      rejection_reason: null,
    });

    // Kích hoạt gửi email bản tin tự động cho subscribers active
    newsletterService.triggerPostPublished(updatedPost);

    return updatedPost;
  }

  // Từ chối bài viết: PENDING -> REJECTED (kèm lý do)
  async rejectPost(id, { reason }, user) {
    const isStaffEditor = user.role === 'super_admin' || user.role === 'admin' || user.role === 'editor';
    if (!isStaffEditor) {
      const error = new Error('Chỉ Editor hoặc Super Admin mới có quyền từ chối bài viết.');
      error.statusCode = 403;
      throw error;
    }

    if (!reason || !reason.trim()) {
      const error = new Error('Vui lòng nhập lý do từ chối bài viết để tác giả có thể chỉnh sửa.');
      error.statusCode = 400;
      throw error;
    }

    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    return await postRepository.updateStatus(id, {
      status: 'rejected',
      rejection_reason: reason.trim(),
    });
  }

  async likePost(id, userId = null) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }
    return await postRepository.likePost(id, userId);
  }

  async sharePost(id) {
    const post = await postRepository.findById(id);
    if (!post) {
      const error = new Error('Bài viết không tồn tại');
      error.statusCode = 404;
      throw error;
    }
    return await postRepository.sharePost(id);
  }
}

module.exports = new PostService();
