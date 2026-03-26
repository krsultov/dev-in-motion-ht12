import { useAuth } from '@/context/auth-context';

export function useAuthToken() {
  const { token } = useAuth();

  return token;
}
