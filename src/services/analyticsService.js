const analyticsRepository = require('../repositories/analyticsRepository');

class AnalyticsService {
  async getOverview() {
    const summary = await analyticsRepository.getAnalyticsSummary();
    const popularPosts = await analyticsRepository.getTopPopularPosts(5);
    const categoryBreakdown = await analyticsRepository.getCategoriesBreakdown();

    return {
      summary,
      popularPosts,
      categoryBreakdown,
    };
  }

  async getPopularPosts(limit = 10) {
    const limitNum = parseInt(limit, 10) || 10;
    return await analyticsRepository.getTopPopularPosts(limitNum);
  }

  async getEngagementPosts(limit = 10) {
    const limitNum = parseInt(limit, 10) || 10;
    return await analyticsRepository.getTopEngagementPosts(limitNum);
  }

  async getCategoriesBreakdown() {
    return await analyticsRepository.getCategoriesBreakdown();
  }

  async recordReadDepth({ postId, milestone, isNewSession }) {
    if (!postId) throw new Error('postId là bắt buộc');
    return await analyticsRepository.recordReadDepth({
      postId: parseInt(postId, 10),
      milestone: milestone ? parseInt(milestone, 10) : null,
      isNewSession: Boolean(isNewSession),
    });
  }

  async getReadDepthByPostId(postId) {
    if (!postId) throw new Error('postId là bắt buộc');
    return await analyticsRepository.getReadDepthByPostId(parseInt(postId, 10));
  }
}

module.exports = new AnalyticsService();
