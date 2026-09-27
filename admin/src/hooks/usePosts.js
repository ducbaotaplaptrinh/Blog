import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services';
import { ADMIN_DASHBOARD_QUERY_KEY } from './useAdmin';
import toast from 'react-hot-toast';

export const POSTS_QUERY_KEY = ['posts'];

export const usePosts = (params = {}) => {
  const query = useQuery({
    queryKey: [...POSTS_QUERY_KEY, params],
    queryFn: () => postService.getAll(params),
  });

  return {
    ...query,
    posts: query.data?.posts ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

export const useMyPosts = (params = {}) => {
  const query = useQuery({
    queryKey: [...POSTS_QUERY_KEY, 'my-posts', params],
    queryFn: () => postService.getMyPosts(params),
  });

  return {
    ...query,
    posts: query.data?.posts ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

export const usePendingPosts = (params = {}) => {
  const query = useQuery({
    queryKey: [...POSTS_QUERY_KEY, 'pending', params],
    queryFn: () => postService.getPending(params),
  });

  return {
    ...query,
    posts: query.data?.posts ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

export const usePostStats = () => {
  const query = useQuery({
    queryKey: [...POSTS_QUERY_KEY, 'stats'],
    queryFn: postService.getStats,
  });

  return {
    ...query,
    stats: query.data ?? { total: 0, pending: 0, published: 0, rejected: 0, draft: 0 },
  };
};

export const useCreatePost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postService.create,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã lưu bài viết thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Không thể tạo bài viết');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    createPost: mutation.mutate,
    isCreating: mutation.isPending,
  };
};

export const useUpdatePost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }) => postService.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã cập nhật bài viết thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Không thể cập nhật bài viết');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    updatePost: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

export const useDeletePost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postService.delete,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã xóa bài viết thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bài viết');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    deletePost: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};

// Hook gửi bài duyệt
export const useSubmitPost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => postService.submit(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã gửi bài viết để xét duyệt!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi duyệt bài');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    submitPost: mutation.mutate,
    isSubmitting: mutation.isPending,
  };
};

// Hook duyệt bài (Approve)
export const useApprovePost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => postService.approve(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã phê duyệt và xuất bản bài viết thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt bài viết');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    approvePost: mutation.mutate,
    isApproving: mutation.isPending,
  };
};

// Hook từ chối bài (Reject)
export const useRejectPost = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, reason }) => postService.reject(id, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã từ chối bài viết kèm lý do!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối bài viết');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    rejectPost: mutation.mutate,
    isRejecting: mutation.isPending,
  };
};
