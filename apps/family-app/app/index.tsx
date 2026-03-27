import { Redirect } from 'expo-router';

export default function IndexScreen() {
  console.log('[navigation] auth disabled, redirecting directly to home');
  return <Redirect href="/(tabs)/home" />;
}
