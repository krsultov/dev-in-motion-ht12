import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { activityItems } from '@/data/dummy';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/lib/useAuthToken';
import type { ActivityItem } from '@/types/api';

const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

const dummyItems: ActivityItem[] = activityItems.slice(0, 2);

type ActivityResponse = {
  items: ActivityItem[];
};

export function useRecentActivity() {
  const token = useAuthToken();
  const { parentId } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.activity(parentId),
    queryFn: () =>
      apiFetch<ActivityResponse>(`/parent/${parentId}/activity?limit=2`, token).then(
        (response) => response.items,
      ),
    enabled: USE_REAL_API && Boolean(token) && Boolean(parentId),
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load recent activity', query.error);
    }
  }, [query.error, query.isError]);

  if (!USE_REAL_API) {
    return {
      items: dummyItems,
      isLoading: false,
      isError: false,
    };
  }

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
