import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { memoryData } from '@/data/dummy';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthToken } from '@/lib/useAuthToken';
import type { MemoryData } from '@/types/api';

const USE_REAL_API = process.env.EXPO_PUBLIC_USE_REAL_API === 'true';

const dummyMemoryData: MemoryData = {
  medications: memoryData.medications.map((item) => ({
    ...item,
    updatedAt: '',
  })),
  contacts: memoryData.contacts.map((item) => ({
    ...item,
    updatedAt: '',
  })),
  preferences: memoryData.preferences.map((item) => ({
    ...item,
    updatedAt: '',
  })),
};

export function useMemory(): {
  data: MemoryData | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const token = useAuthToken();
  const { parentId } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.memory(parentId),
    queryFn: () => apiFetch<MemoryData>(`/parent/${parentId}/memory`, token),
    enabled: USE_REAL_API && Boolean(token) && Boolean(parentId),
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load memory data', query.error);
    }
  }, [query.error, query.isError]);

  if (!USE_REAL_API) {
    return {
      data: dummyMemoryData,
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
