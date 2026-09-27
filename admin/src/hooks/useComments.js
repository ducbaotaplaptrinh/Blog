import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services';
import { POSTS_QUERY_KEY } from './usePosts';
import { ADMIN_DASHBOARD_QUERY_KEY } from './useAdmin';
import { USERS_QUERY_KEY } from './useUsers';
import toast from 'react-hot-toast';

export const COMMENTS_QUERY_KEY = ['comments'];

export const useComments = (params = {}) => {
  const query = useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, params],
    queryFn: () => commentService.getAll(params),
  });

  return {
    ...query,
    comments: query.data?.comments ?? [],
    total: query.data?.total ?? 0,
  };
};

export const useCommentStats = () => {
  const query = useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, 'stats'],
    queryFn: () => commentService.getStats(),
  });

  return {
    ...query,
    stats: query.data ?? { total: 0, pending: 0, approved: 0, hidden: 0, today_count: 0 },
  };
};

export const usePendingComments = (params = {}) => {
  const query = useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, 'pending', params],
    queryFn: () => commentService.getPending(params),
  });

  return {
    ...query,
    comments: query.data?.comments ?? [],
    total: query.data?.total ?? 0,
  };
};

export const usePostCommentGroups = (params = {}) => {
  const query = useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, 'by-post', params],
    queryFn: () => commentService.getByPost(params),
  });

  return {
    ...query,
    posts: query.data?.posts ?? [],
    total: query.data?.total ?? 0,
  };
};

export const useAdminPostComments = (postId) => {
  const query = useQuery({
    queryKey: [...COMMENTS_QUERY_KEY, 'post', postId, 'admin'],
    queryFn: () => commentService.getAdminPostComments(postId),
    enabled: !!postId,
  });

  return {
    ...query,
    comments: query.data ?? [],
  };
};

export const usePostComments = (postId) => {
  const query = useQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => commentService.getByPostId(postId),
    enabled: !!postId,
  });

  return {
    ...query,
    comments: query.data ?? [],
  };
};

export const useUpdateCommentStatus = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, status }) => commentService.updateStatus(id, status),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      const statusLabels = {
        approved: 'Đã duyệt bình luận',
        hidden: 'Đã ẩn bình luận',
        pending: 'Đã chuyển về chờ duyệt',
      };
      toast.success(statusLabels[variables.status] || 'Cập nhật trạng thái thành công');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    updateStatus: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};

export const useDeleteComment = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id) => commentService.delete(id),
    onSuccess: (data, variables, context) => {
      // Invalidate toàn bộ các query liên quan để cập nhật giao diện thời gian thực
      queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      toast.success('Đã xóa bình luận thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa bình luận');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    deleteComment: mutation.mutate,
    isDeleting: mutation.isPending,
  };
};
