import React, { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories';
import { Button } from '../components/ui/Button/Button';
import { Modal } from '../components/ui/Modal/Modal';
import { CategoryForm } from '../components/categories/CategoryForm';
import { FolderTree, Plus, Search, Pencil, Trash2 } from 'lucide-react';

export const CategoriesManagement = () => {
  const [search, setSearch] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { categories, isLoading: isCategoriesLoading } = useCategories();

  const { createCategory, isPending: isCreatingCategory } = useCreateCategory({
    onSuccess: () => {
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
  });

  const { updateCategory, isPending: isUpdatingCategory } = useUpdateCategory({
    onSuccess: () => {
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    },
  });

  const { deleteCategory } = useDeleteCategory();

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (formData) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data: formData });
    } else {
      createCategory(formData);
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Các bài viết thuộc danh mục sẽ không bị xóa.')) {
      deleteCategory(id);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Quản Lý Danh Mục</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Phân loại chủ đề bài viết và tối ưu hóa cấu trúc đường dẫn danh mục
          </p>
        </div>
        <Button onClick={handleOpenCreateCategory}>
          <Plus size={18} /> Thêm Danh Mục Mới
        </Button>
      </div>

      {/* Main Table Panel */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <FolderTree size={20} className="text-amber-500 dark:text-amber-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Danh Sách Danh Mục ({filteredCategories.length})
            </h3>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {isCategoriesLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Đang tải danh sách danh mục...
          </div>
        ) : filteredCategories.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">Không tìm thấy danh mục nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase">
                  <th className="py-3 px-4">TÊN DANH MỤC</th>
                  <th className="py-3 px-4">SLUG ĐƯỜNG DẪN</th>
                  <th className="py-3 px-4">MÔ TẢ</th>
                  <th className="py-3 px-4 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 text-xs font-mono">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="px-2.5 py-1 text-xs"
                        >
                          <Pencil size={14} /> Sửa
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-2.5 py-1 text-xs"
                        >
                          <Trash2 size={14} /> Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo/Sửa Danh Mục */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
      >
        <CategoryForm
          onSubmit={handleSaveCategory}
          loading={isCreatingCategory || isUpdatingCategory}
          initialData={editingCategory}
        />
      </Modal>
    </div>
  );
};
