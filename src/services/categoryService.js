const categoryRepository = require('../repositories/categoryRepository');
const postRepository = require('../repositories/postRepository');
const slugify = require('../utils/slugify');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async getCategoryBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }
    return category;
  }

  async createCategory({ name, description }) {
    if (!name) throw new Error('Category name is required');
    const slug = slugify(name);

    const existingSlug = await categoryRepository.findBySlug(slug);
    if (existingSlug) throw new Error('Category with this name already exists');

    return await categoryRepository.create({ name, slug, description });
  }

  async updateCategory(id, { name, description }) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');

    const slug = name ? slugify(name) : category.slug;
    return await categoryRepository.update(id, {
      name: name || category.name,
      slug,
      description: description !== undefined ? description : category.description,
    });
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Category not found');

    const postsCount = await postRepository.countAll({ category_id: id });
    if (postsCount > 0) {
      throw new Error(`Không thể xóa danh mục này vì đang có ${postsCount} bài viết liên kết. Vui lòng chuyển bài viết sang danh mục khác trước!`);
    }

    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
