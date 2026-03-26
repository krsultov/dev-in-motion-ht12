import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { activityItems } from '@/data/dummy';
import { fetchActivity } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/lib/useAuthToken';
import type { ActivityItem, ActivityResponse } from '@/types/api';

const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

const dummyPage: ActivityResponse = {
  items: activityItems,
  nextCursor: null,
  hasMore: false,
};

export function useActivityFeed(): {
  items: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
} {
  const token = useAuthToken();
  const { parentId } = useAuth();

  const query = useInfiniteQuery({
    queryKey: queryKeys.activityFeed(parentId),
    queryFn: ({ pageParam }) => fetchActivity(parentId, token, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: USE_REAL_API && Boolean(token) && Boolean(parentId),
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load activity feed', query.error);
    }
  }, [query.error, query.isError]);

  if (!USE_REAL_API) {
    return {
      items: dummyPage.items,
      isLoading: false,
      isError: false,
      hasMore: dummyPage.hasMore,
      fetchNextPage: () => undefined,
      isFetchingNextPage: false,
    };
  }

  const pages = query.data?.pages ?? [];

  return {
    items: pages.flatMap((page) => page.items),
    isLoading: query.isLoading,
    isError: query.isError,
    hasMore: pages.length > 0 ? pages[pages.length - 1]?.hasMore ?? false : false,
    fetchNextPage: () => {
      void query.fetchNextPage();
    },
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
