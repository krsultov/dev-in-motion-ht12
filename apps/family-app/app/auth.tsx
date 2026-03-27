import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Surface, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/context/auth-context';
import { getCurrentUserMemory } from '@/lib/memory-api';

export default function AuthScreen() {
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      Alert.alert('Missing details', 'Enter your phone number to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const record = await getCurrentUserMemory(trimmedPhone);
      if (!record) {
        Alert.alert('Not found', 'No account found for that phone number.');
        return;
      }
      signIn({ name: record.name ?? 'Family member', phone: trimmedPhone });
      router.replace('/(tabs)/home');
    } catch {
      Alert.alert('Error', 'Could not reach the server. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Nelson
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign in with the phone number linked to your Nelson account.
        </Text>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Welcome back
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Your account is created automatically the first time you call Nelson. If you haven't
            called yet, do that first — no sign-up needed.
          </Text>

          <TextInput
            label="Phone number"
            mode="outlined"
            keyboardType="phone-pad"
            textColor="#FFFFFF"
            outlineColor="#2D2D2D"
            activeOutlineColor="#8B8DF1"
            value={phone}
            onChangeText={setPhone}
          />

          <Button
            mode="contained"
            buttonColor="#8B8DF1"
            textColor="#18181B"
            style={styles.submitButton}
            loading={isLoading}
            disabled={isLoading}
            onPress={() => void handleSignIn()}>
            Sign In
          </Button>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    letterSpacing: -0.4,
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    gap: 16,
    padding: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardText: {
    color: '#A1A1AA',
    lineHeight: 22,
  },
  submitButton: {
    borderRadius: 14,
    marginTop: 4,
  },
});
