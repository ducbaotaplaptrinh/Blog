import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '../services';
import { ADMIN_DASHBOARD_QUERY_KEY } from './useAdmin';
import toast from 'react-hot-toast';

export const CONTACTS_QUERY_KEY = ['admin', 'contacts'];

export const useContacts = (params = {}) => {
  const query = useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, params],
    queryFn: () => contactService.getAll(params),
  });

  return {
    ...query,
    contacts: query.data?.contacts ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

export const useContactStats = () => {
  const query = useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, 'stats'],
    queryFn: () => contactService.getStats(),
  });

  return {
    ...query,
    stats: query.data ?? { total: 0, new: 0, in_progress: 0, resolved: 0, spam: 0 },
  };
};

export const useContactDetail = (id) => {
  return useQuery({
    queryKey: [...CONTACTS_QUERY_KEY, 'detail', id],
    queryFn: () => contactService.getById(id),
    enabled: !!id,
  });
};

export const useUpdateContactStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, admin_notes }) => contactService.updateStatus(id, { status, admin_notes }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success(data?.message || 'Cập nhật trạng thái liên hệ thành công!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thao tác thất bại.');
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => contactService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_DASHBOARD_QUERY_KEY });
      toast.success('Đã xóa thư liên hệ thành công.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa thư liên hệ.');
    },
  });
};
