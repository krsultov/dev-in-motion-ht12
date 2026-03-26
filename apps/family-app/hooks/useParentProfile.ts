import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { parentProfile } from '@/data/dummy';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/lib/useAuthToken';
import type { ParentProfile } from '@/types/api';

const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

const dummyProfile: ParentProfile = {
  id: 'demo-parent-id',
  name: parentProfile.name,
  initials: parentProfile.initials,
  phoneNumber: parentProfile.phone,
  aiActive: parentProfile.aiActive,
  lastActiveAt: parentProfile.lastActive,
};

export function useParentProfile() {
  const token = useAuthToken();
  const { parentId } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.profile(parentId),
    queryFn: () => apiFetch<ParentProfile>(`/parent/${parentId}/profile`, token),
    enabled: USE_REAL_API && Boolean(token) && Boolean(parentId),
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load parent profile', query.error);
    }
  }, [query.error, query.isError]);

  if (!USE_REAL_API) {
    return {
      data: dummyProfile,
      isLoading: false,
      isError: false,
    };
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
