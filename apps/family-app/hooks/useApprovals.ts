import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { approvals } from '@/data/dummy';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/lib/useAuthToken';
import type { Approval } from '@/types/api';

const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

const dummyItems: Approval[] = approvals.map((item) => ({
  ...item,
  resolvedAt: item.status === 'pending' ? null : item.requestedAt,
}));

type ApprovalsResponse = {
  items: Approval[];
};

export function useApprovals() {
  const token = useAuthToken();
  const { parentId } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.approvals(parentId),
    queryFn: () =>
      apiFetch<ApprovalsResponse>(`/parent/${parentId}/approvals?status=pending`, token).then(
        (response) => response.items,
      ),
    enabled: USE_REAL_API && Boolean(token) && Boolean(parentId),
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load approvals', query.error);
    }
  }, [query.error, query.isError]);

  const items = USE_REAL_API ? query.data ?? [] : dummyItems;

  return {
    items,
    pendingCount: items.filter((item) => item.status === 'pending').length,
    isLoading: USE_REAL_API ? query.isLoading : false,
    isError: USE_REAL_API ? query.isError : false,
  };
}
