import { useQuery } from '@tanstack/react-query';
import { fetchDashboardAnalytics } from '@/services/analytics.service';

export function useAnalytics() {
  const query = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchDashboardAnalytics,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
