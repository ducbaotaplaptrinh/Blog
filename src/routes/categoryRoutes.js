const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getOne);

// Protected Admin routes
router.post('/', authenticateToken, requireAdmin, categoryController.create);
router.put('/:id', authenticateToken, requireAdmin, categoryController.update);
router.delete('/:id', authenticateToken, requireAdmin, categoryController.delete);

module.exports = router;
