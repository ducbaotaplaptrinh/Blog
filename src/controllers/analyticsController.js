const analyticsService = require('../services/analyticsService');

class AnalyticsController {
  async getOverview(req, res, next) {
    try {
      const data = await analyticsService.getOverview();
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  async getPopularPosts(req, res, next) {
    try {
      const { limit } = req.query;
      const posts = await analyticsService.getPopularPosts(limit);
      res.status(200).json({ status: 'success', data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  async getEngagement(req, res, next) {
    try {
      const { limit } = req.query;
      const posts = await analyticsService.getEngagementPosts(limit);
      res.status(200).json({ status: 'success', data: { posts } });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await analyticsService.getCategoriesBreakdown();
      res.status(200).json({ status: 'success', data: { categories } });
    } catch (error) {
      next(error);
    }
  }

  async recordScrollDepth(req, res, next) {
    try {
      const { postId, milestone, isNewSession } = req.body;
      const result = await analyticsService.recordReadDepth({ postId, milestone, isNewSession });
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getReadDepth(req, res, next) {
    try {
      const { postId } = req.params;
      const result = await analyticsService.getReadDepthByPostId(postId);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
