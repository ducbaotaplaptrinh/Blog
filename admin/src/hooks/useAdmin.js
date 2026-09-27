import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services';

export const ADMIN_DASHBOARD_QUERY_KEY = ['admin', 'dashboard'];

export const useAdminDashboard = () => {
  const query = useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: () => adminService.getDashboard(),
  });

  return {
    ...query,
    stats: query.data?.stats ?? {
      totalUsers: 0,
      totalPosts: 0,
      totalCategories: 0,
      totalComments: 0,
      pendingPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      pendingComments: 0,
      totalViews: 0,
      avgCompletionRate: 0,
      totalLikes: 0,
    },
    recentPosts: query.data?.recentPosts ?? [],
    recentComments: query.data?.recentComments ?? [],
    recentUsers: query.data?.recentUsers ?? [],
  };
};
