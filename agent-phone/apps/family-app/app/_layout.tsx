import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import { AuthProvider } from '@/context/auth-context';

export default function RootLayout() {
  void Notifications;

  const navigationTheme = {
    ...NavigationDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      background: '#121212',
      card: '#1E1E1E',
      primary: '#8B8DF1',
      text: '#FFFFFF',
    },
  };

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      background: '#121212',
      onSurface: '#FFFFFF',
      onSurfaceVariant: '#A1A1AA',
      outline: '#2D2D2D',
      primary: '#8B8DF1',
      secondary: '#CDCFFC',
      surface: '#1E1E1E',
      surfaceVariant: '#2D2D2D',
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
