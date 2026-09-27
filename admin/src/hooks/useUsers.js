import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services';
import { ADMIN_DASHBOARD_QUERY_KEY } from './useAdmin';
import toast from 'react-hot-toast';

export const USERS_QUERY_KEY = ['users'];

export const useUsers = () => {
  const query = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => userService.getAll(),
  });

  return {
    ...query,
    users: query.data ?? [],
  };
};

export const useUserDetail = (userId) => {
  const query = useQuery({
    queryKey: [...USERS_QUERY_KEY, userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
  });

  return {
    ...query,
    userDetail: query.data?.user ?? null,
    userComments: query.data?.comments ?? [],
  };
};

export const useUpdateUserRole = (options = {}) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã cập nhật vai trò người dùng thành công!');
      options.onSuccess?.(data, variables, context);
    },
    onError: (err, variables, context) => {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật vai trò người dùng');
      options.onError?.(err, variables, context);
    },
  });

  return {
    ...mutation,
    updateUserRole: mutation.mutate,
    isUpdatingRole: mutation.isPending,
  };
};
