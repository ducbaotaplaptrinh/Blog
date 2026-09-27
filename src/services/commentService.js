const commentRepository = require('../repositories/commentRepository');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

class CommentService {
  async getAllComments({ limit = 50, offset = 0, status, search, post_id, user_id } = {}) {
    const comments = await commentRepository.findAll({ limit, offset, status, search, post_id, user_id });
    const total = await commentRepository.countAll({ status, search, post_id, user_id });
    return { comments, total };
  }

  async getCommentStats() {
    return await commentRepository.getStats();
  }

  async getPendingComments({ limit = 20, offset = 0 } = {}) {
    const comments = await commentRepository.findPendingComments({ limit, offset });
    const total = await commentRepository.countPendingComments();
    return { comments, total };
  }

  async getPostCommentGroups({ limit = 15, offset = 0, search = '' } = {}) {
    const posts = await commentRepository.findPostCommentGroups({ limit, offset, search });
    const total = await commentRepository.countPostCommentGroups({ search });
    return { posts, total };
  }

  async getAdminPostComments(postId) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }
    const comments = await commentRepository.findAdminByPostId(postId);
    return comments;
  }

  async updateCommentStatus(id, status, user) {
    const allowedStatuses = ['approved', 'pending', 'hidden'];
    if (!allowedStatuses.includes(status)) {
      const error = new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${allowedStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const existing = await commentRepository.findById(id);
    if (!existing) {
      const error = new Error('Bình luận không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    const updated = await commentRepository.updateStatus(id, status);
    return updated;
  }

  async getCommentsByPostId(postId) {
    if (!postId) {
      const error = new Error('Post ID is required');
      error.statusCode = 400;
      throw error;
    }
    const comments = await commentRepository.findByPostId(postId);
    return comments;
  }

  async getCommentsByUserId(userId) {
    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }
    const comments = await commentRepository.findByUserId(userId);
    return comments;
  }

  async createComment({ post_id, user_id, user, content, parent_id = null, username, email }) {
    if (!post_id || !content || !content.trim()) {
      const error = new Error('Bài viết và nội dung bình luận không được để trống');
      error.statusCode = 400;
      throw error;
    }

    const numericPostId = parseInt(post_id, 10);
    let validParentId = null;

    // Xác thực bảo mật: parent_id phải tồn tại và phải thuộc về cùng bài viết
    if (parent_id) {
      const numericParentId = parseInt(parent_id, 10);
      const parentComment = await commentRepository.findById(numericParentId);
      if (!parentComment) {
        const error = new Error('Bình luận gốc không tồn tại hoặc đã bị xóa');
        error.statusCode = 404;
        throw error;
      }
      if (parentComment.post_id !== numericPostId) {
        const error = new Error('Bình luận gốc không thuộc về bài viết này');
        error.statusCode = 400;
        throw error;
      }
      validParentId = numericParentId;
    }

    let commenterId = user_id;

    // Nếu là độc giả vãng lai (Guest chưa đăng nhập)
    if (!commenterId) {
      const cleanName = (username || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanName) {
        const error = new Error('Vui lòng nhập họ tên của bạn trước khi gửi bình luận');
        error.statusCode = 400;
        throw error;
      }

      if (!cleanEmail) {
        const error = new Error('Vui lòng nhập địa chỉ email để xác thực bình luận');
        error.statusCode = 400;
        throw error;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        const error = new Error('Địa chỉ email không đúng định dạng hợp lệ');
        error.statusCode = 400;
        throw error;
      }

      let existingUser = await userRepository.findByEmail(cleanEmail);
      if (!existingUser) {
        const dummyHash = await bcrypt.hash('reader_password_123', 8);
        existingUser = await userRepository.create({
          username: cleanName,
          email: cleanEmail,
          password_hash: dummyHash,
          role: 'user',
        });
      }
      commenterId = existingUser.id;
    }

    // Ban Quản trị / Biên tập viên bình luận thì được tự động duyệt; Độc giả và khách luôn mang trạng thái 'pending'
    const isStaff = user && ['admin', 'super_admin', 'editor'].includes(user.role);
    const commentStatus = isStaff ? 'approved' : 'pending';

    const newComment = await commentRepository.create({
      post_id: numericPostId,
      user_id: commenterId,
      content: content.trim(),
      parent_id: validParentId,
      status: commentStatus,
    });

    const fullComment = await commentRepository.findById(newComment.id);
    return fullComment;
  }

  async deleteComment(id) {
    const existing = await commentRepository.findById(id);
    if (!existing) {
      const error = new Error('Comment not found');
      error.statusCode = 404;
      throw error;
    }
    const deleted = await commentRepository.delete(id);
    return deleted;
  }
}

module.exports = new CommentService();
