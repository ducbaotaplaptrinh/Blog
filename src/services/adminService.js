const userRepository = require('../repositories/userRepository');
const postRepository = require('../repositories/postRepository');
const categoryRepository = require('../repositories/categoryRepository');
const commentRepository = require('../repositories/commentRepository');
const analyticsRepository = require('../repositories/analyticsRepository');
const contactRepository = require('../repositories/contactRepository');

class AdminService {
  // Lấy dữ liệu thống kê tổng quan và hoạt động gần đây cho Dashboard
  async getDashboardStats() {
    const [
      totalUsers,
      totalPosts,
      totalCategories,
      totalComments,
      pendingPosts,
      publishedPosts,
      draftPosts,
      pendingComments,
      contactStats,
      analyticsSummary,
      recentPosts,
      recentComments,
      recentUsers,
    ] = await Promise.all([
      userRepository.countAll(),
      postRepository.countAll({}),
      categoryRepository.countAll(),
      commentRepository.countAll(),
      postRepository.countAll({ status: 'pending' }),
      postRepository.countAll({ status: 'published' }),
      postRepository.countAll({ status: 'draft' }),
      commentRepository.countAll({ status: 'pending' }),
      contactRepository.getStats(),
      analyticsRepository.getAnalyticsSummary(),
      postRepository.getRecentPosts(6),
      commentRepository.getRecentComments(6),
      userRepository.getRecentUsers(6),
    ]);

    return {
      stats: {
        totalUsers,
        totalPosts,
        totalCategories,
        totalComments,
        pendingPosts: pendingPosts || 0,
        publishedPosts: publishedPosts || 0,
        draftPosts: draftPosts || 0,
        pendingComments: pendingComments || 0,
        newContacts: contactStats?.new || 0,
        totalViews: analyticsSummary?.total_views || 0,
        avgCompletionRate: analyticsSummary?.avg_completion_rate || 0,
        totalLikes: analyticsSummary?.total_likes || 0,
      },
      recentPosts,
      recentComments,
      recentUsers,
    };
  }

  // Lấy danh sách users kèm số lượng comments
  async getAllUsers() {
    const users = await userRepository.findAllWithStats();
    return users;
  }

  // Lấy chi tiết user kèm danh sách các bình luận và bài viết liên quan
  async getUserDetail(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const comments = await commentRepository.findByUserId(id);

    return {
      user,
      comments,
    };
  }

  // Cập nhật vai trò cho người dùng (Chỉ Super Admin)
  async updateUserRole(id, role, requester) {
    const validRoles = ['super_admin', 'editor', 'author', 'user', 'admin'];
    if (!validRoles.includes(role)) {
      const error = new Error(`Vai trò không hợp lệ. Phải là một trong: ${validRoles.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.statusCode = 404;
      throw error;
    }

    // Không cho phép tự hạ quyền của chính mình nếu là super_admin đang đăng nhập
    if (requester && requester.id === parseInt(id, 10) && role !== 'super_admin' && role !== 'admin') {
      const error = new Error('Bạn không thể tự hạ quyền Super Admin của chính mình.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await userRepository.updateRole(id, role);
    return updated;
  }
}

module.exports = new AdminService();
