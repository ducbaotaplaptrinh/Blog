const categoryService = require('../services/categoryService');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({ status: 'success', data: { categories } });
    } catch (error) { next(error); }
  }

  async getOne(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({ status: 'success', data: { category } });
    } catch (error) { next(error); }
  }

  async getBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.status(200).json({ status: 'success', data: { category } });
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.createCategory({ name, description });
      res.status(201).json({ status: 'success', data: { category } });
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.updateCategory(req.params.id, { name, description });
      res.status(200).json({ status: 'success', data: { category } });
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(200).json({ status: 'success', message: 'Category deleted successfully' });
    } catch (error) { next(error); }
  }
}

module.exports = new CategoryController();
