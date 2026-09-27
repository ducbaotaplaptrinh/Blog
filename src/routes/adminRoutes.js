const express = require('express');
const adminController = require('../controllers/adminController');
const commentController = require('../controllers/commentController');
const { authenticateToken, requireEditorOrAbove, requireSuperAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Bảo vệ toàn bộ Admin routes
router.use(authenticateToken);

// Thống kê Dashboard (Editor & Super Admin)
router.get('/dashboard', requireEditorOrAbove, adminController.getDashboard);

// Quản lý Users trong Admin (Chỉ Super Admin)
router.get('/users', requireSuperAdmin, adminController.getUsers);
router.get('/users/:id', requireSuperAdmin, adminController.getUserById);
router.put('/users/:id/role', requireSuperAdmin, adminController.updateUserRole);
router.get('/users/:id/comments', requireSuperAdmin, commentController.getByUserId);

module.exports = router;
