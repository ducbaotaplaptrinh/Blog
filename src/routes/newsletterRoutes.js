const express = require('express');
const newsletterController = require('../controllers/newsletterController');
const { authenticateToken, requireEditorOrAbove, requireSuperAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Routes công khai
router.post('/subscribe', newsletterController.subscribe);
router.get('/unsubscribe', newsletterController.unsubscribe);

// 2. Routes quản trị
router.get('/admin/subscribers', authenticateToken, requireEditorOrAbove, newsletterController.getSubscribers);
router.get('/admin/stats', authenticateToken, requireEditorOrAbove, newsletterController.getStats);
router.get('/admin/deliveries', authenticateToken, requireEditorOrAbove, newsletterController.getDeliveries);
router.patch('/admin/subscribers/:id/unsubscribe', authenticateToken, requireEditorOrAbove, newsletterController.unsubscribeAdmin);
router.delete('/admin/subscribers/:id', authenticateToken, requireSuperAdmin, newsletterController.deleteSubscriber);

module.exports = router;
