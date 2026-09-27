const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireEditorOrAbove } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Endpoint công khai tiếp nhận ghi nhận hành vi đọc (Read Depth / Scroll Depth) và Top bài viết xem nhiều
router.post('/scroll', analyticsController.recordScrollDepth);
router.get('/top-popular', analyticsController.getPopularPosts);

// 2. Bảo vệ các endpoint Analytics nội bộ dành cho Editor & Super Admin
router.get('/overview', authenticateToken, requireEditorOrAbove, analyticsController.getOverview);
router.get('/popular-posts', authenticateToken, requireEditorOrAbove, analyticsController.getPopularPosts);
router.get('/engagement', authenticateToken, requireEditorOrAbove, analyticsController.getEngagement);
router.get('/categories', authenticateToken, requireEditorOrAbove, analyticsController.getCategories);
router.get('/read-depth/:postId', authenticateToken, requireEditorOrAbove, analyticsController.getReadDepth);

module.exports = router;
