import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services';
import toast from 'react-hot-toast';

export const CATEGORIES_QUERY_KEY = ['categories'];

export const useCategories = () => {
  const query = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: () => categoryService.getAll(),
  });

  return {
    ...query,
    categories: query.data ?? [],
  };
};

export const useCreateCategory = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Đã tạo danh mục mới thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Không thể tạo danh mục');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    createCategory: mutation.mutate,
  };
};

export const useUpdateCategory = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Đã cập nhật danh mục thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật danh mục');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    updateCategory: mutation.mutate,
  };
};

export const useDeleteCategory = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Đã xóa danh mục thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa danh mục');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    deleteCategory: mutation.mutate,
  };
};
