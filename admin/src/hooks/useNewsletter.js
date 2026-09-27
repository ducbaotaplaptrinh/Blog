import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterService } from '../services';
import toast from 'react-hot-toast';

export const NEWSLETTER_QUERY_KEY = ['admin', 'newsletter'];

export const useNewsletterSubscribers = (params = {}) => {
  const query = useQuery({
    queryKey: [...NEWSLETTER_QUERY_KEY, 'subscribers', params],
    queryFn: () => newsletterService.getSubscribers(params),
  });

  return {
    ...query,
    subscribers: query.data?.subscribers ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 1 },
  };
};

export const useNewsletterStats = () => {
  const query = useQuery({
    queryKey: [...NEWSLETTER_QUERY_KEY, 'stats'],
    queryFn: () => newsletterService.getStats(),
  });

  return {
    ...query,
    stats: query.data ?? {
      total_subscribers: 0,
      active_subscribers: 0,
      unsubscribed_count: 0,
      total_sent_emails: 0,
      total_campaigns: 0,
    },
  };
};

export const useNewsletterDeliveries = (params = {}) => {
  const query = useQuery({
    queryKey: [...NEWSLETTER_QUERY_KEY, 'deliveries', params],
    queryFn: () => newsletterService.getDeliveries(params),
  });

  return {
    ...query,
    deliveries: query.data?.deliveries ?? [],
  };
};

export const useUnsubscribeSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => newsletterService.unsubscribe(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_QUERY_KEY });
      toast.success(data?.message || 'Đã hủy đăng ký cho email này.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Thao tác thất bại.');
    },
  });
};

export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => newsletterService.deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWSLETTER_QUERY_KEY });
      toast.success('Đã xóa người đăng ký thành công.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Không thể xóa người đăng ký.');
    },
  });
};
