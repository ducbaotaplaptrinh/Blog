import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services';

export const ANALYTICS_KEYS = {
  overview: ['analytics', 'overview'],
  popular: (limit) => ['analytics', 'popular', limit],
  engagement: (limit) => ['analytics', 'engagement', limit],
  categories: ['analytics', 'categories'],
  readDepth: (postId) => ['analytics', 'readDepth', postId],
};

export const useAnalyticsOverview = () => {
  const query = useQuery({
    queryKey: ANALYTICS_KEYS.overview,
    queryFn: () => analyticsService.getOverview(),
  });

  return {
    ...query,
    summary: query.data?.summary ?? {
      published_posts_count: 0,
      total_views: 0,
      total_comments: 0,
      total_users: 0,
      total_read_sessions: 0,
      total_completed_reads: 0,
      avg_completion_rate: 0,
    },
    popularPosts: query.data?.popularPosts ?? [],
    categoryBreakdown: query.data?.categoryBreakdown ?? [],
  };
};

export const usePopularPosts = (limit = 10) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.popular(limit),
    queryFn: () => analyticsService.getPopularPosts(limit),
  });
};

export const useEngagementPosts = (limit = 10) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.engagement(limit),
    queryFn: () => analyticsService.getEngagement(limit),
  });
};

export const useCategoryBreakdown = () => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.categories,
    queryFn: () => analyticsService.getCategories(),
  });
};

export const usePostReadDepth = (postId) => {
  return useQuery({
    queryKey: ANALYTICS_KEYS.readDepth(postId),
    queryFn: () => analyticsService.getReadDepth(postId),
    enabled: Boolean(postId),
  });
};
