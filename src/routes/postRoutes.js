const express = require('express');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const {
  authenticateToken,
  optionalAuth,
  requireStaff,
  requireEditorOrAbove,
} = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Tuyến đường công khai (Public)
router.get('/', postController.getAll);
router.get('/popular', postController.getPopular);
router.get('/slug/:slug', optionalAuth, postController.getBySlug);

// 2. Tuyến đường danh sách đặc biệt có bảo vệ (phải đặt trước /:id)
router.get('/stats', optionalAuth, postController.getStats);
router.get('/my-posts', authenticateToken, requireStaff, postController.getMyPosts);
router.get('/pending', authenticateToken, requireEditorOrAbove, postController.getPending);

// 3. Tuyến đường chi tiết bài viết và bình luận
router.get('/:id', postController.getById);
router.get('/:id/comments', commentController.getByPostId);

// 4. Tuyến đường tạo, sửa, xóa bài viết
router.post('/', authenticateToken, requireStaff, postController.create);
router.put('/:id', authenticateToken, requireStaff, postController.update);
router.delete('/:id', authenticateToken, requireStaff, postController.delete);

// 5. Tuyến đường quy trình duyệt bài (Workflow state machine)
router.post('/:id/submit', authenticateToken, requireStaff, postController.submit);
router.post('/:id/approve', authenticateToken, requireEditorOrAbove, postController.approve);
router.post('/:id/reject', authenticateToken, requireEditorOrAbove, postController.reject);

// 6. Tuyến đường tương tác (Like & Share)
router.post('/:id/like', optionalAuth, postController.like);
router.post('/:id/share', postController.share);

module.exports = router;
