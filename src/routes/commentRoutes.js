const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticateToken, optionalAuth, requireAdmin, requireEditorOrAbove } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Thống kê KPI bình luận cho Admin Center
router.get('/stats', authenticateToken, requireEditorOrAbove, commentController.getStats);

// 2. Action Queue: Danh sách bình luận chờ duyệt (Pending / Hidden)
router.get('/pending', authenticateToken, requireEditorOrAbove, commentController.getPending);

// 3. Gom nhóm theo bài viết (Group by Post)
router.get('/by-post', authenticateToken, requireEditorOrAbove, commentController.getPostGroups);

// 4. Lấy toàn bộ cây bình luận của một bài viết cho Admin (bao gồm pending, approved, hidden)
router.get('/post/:id/admin', authenticateToken, requireEditorOrAbove, commentController.getAdminByPostId);

// 5. Cập nhật trạng thái duyệt bình luận ('approved', 'hidden', 'pending')
router.patch('/:id/status', authenticateToken, requireEditorOrAbove, commentController.updateStatus);

// 6. Lấy danh sách toàn bộ bình luận (Admin filter & tra cứu)
router.get('/', authenticateToken, requireAdmin, commentController.getAll);

// 7. Lấy bình luận công khai theo bài viết (Public Blog - chỉ approved)
router.get('/post/:id', commentController.getByPostId);

// 8. Gửi bình luận mới (Public / Độc giả / User)
router.post('/', optionalAuth, commentController.create);

// 9. Xóa bình luận (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, commentController.delete);

module.exports = router;

