const express = require('express');
const contactController = require('../controllers/contactController');
const { authenticateToken, requireEditorOrAbove, requireSuperAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Route công khai: Độc giả gửi liên hệ tòa soạn
router.post('/', contactController.submitContact);

// 2. Routes quản trị: Yêu cầu JWT & vai trò Editor hoặc Super Admin
router.get('/admin', authenticateToken, requireEditorOrAbove, contactController.getContacts);
router.get('/admin/stats', authenticateToken, requireEditorOrAbove, contactController.getStats);
router.get('/admin/:id', authenticateToken, requireEditorOrAbove, contactController.getById);
router.patch('/admin/:id/status', authenticateToken, requireEditorOrAbove, contactController.updateStatus);
router.delete('/admin/:id', authenticateToken, requireSuperAdmin, contactController.deleteContact);

module.exports = router;
