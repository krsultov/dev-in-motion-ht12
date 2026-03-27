import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

export default function IndexScreen() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) return null;

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/auth'} />;
}
