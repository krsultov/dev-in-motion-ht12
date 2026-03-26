import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Surface, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/context/auth-context';
import { parentProfile } from '@/data/dummy';

export default function AuthScreen() {
  // This screen renders a local-only OTP gate for the family member app.
  const [otp, setOtp] = useState<string>('');
  const { setIsAuthenticated } = useAuth();

  const handleContinue = () => {
    if (otp !== '123456') {
      Alert.alert('Incorrect code', 'Use the demo OTP 123456 to enter the app.');
      return;
    }

    setIsAuthenticated(true);
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Nelson
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Stay informed about how the AI assistant is helping {parentProfile.name}.
        </Text>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Family access
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Enter the demo OTP to open the oversight dashboard. No real authentication is wired yet.
          </Text>
          <TextInput
            label="One-time code"
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <Button mode="contained" onPress={handleContinue}>
            Verify OTP
          </Button>
          <Text variant="bodySmall" style={styles.hint}>
            Demo code: 123456
          </Text>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    lineHeight: 24,
  },
  card: {
    borderRadius: 20,
    gap: 16,
    padding: 20,
  },
  cardTitle: {
    fontWeight: '700',
  },
  cardText: {
    color: '#475569',
    lineHeight: 22,
  },
  hint: {
    color: '#64748B',
  },
});
