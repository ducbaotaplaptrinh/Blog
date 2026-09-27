const express = require('express');
const adminController = require('../controllers/adminController');
const commentController = require('../controllers/commentController');
const { authenticateToken, requireSuperAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Bảo vệ toàn bộ User management routes chỉ dành riêng cho Super Admin
router.use(authenticateToken, requireSuperAdmin);

// Lấy danh sách users
router.get('/', adminController.getUsers);

// Lấy chi tiết user kèm thông tin comments
router.get('/:id', adminController.getUserById);

// Cập nhật vai trò (Role) cho user
router.put('/:id/role', adminController.updateUserRole);

// Lấy danh sách comments của user
router.get('/:id/comments', commentController.getByUserId);

module.exports = router;
