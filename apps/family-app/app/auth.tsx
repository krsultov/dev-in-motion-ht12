import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Surface, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/context/auth-context';

type AuthMode = 'register' | 'signin';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { signIn } = useAuth();

  const isRegisterMode = mode === 'register';

  const handleContinue = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (isRegisterMode && (!trimmedName || !trimmedPhone || !trimmedPassword)) {
      Alert.alert('Missing details', 'Enter your name, phone number, and password to continue.');
      return;
    }

    if (!isRegisterMode && !trimmedPhone) {
      Alert.alert('Missing details', 'Enter your phone number to continue.');
      return;
    }

    signIn({
      name: isRegisterMode ? trimmedName : trimmedName || 'Family member',
      phone: trimmedPhone,
    });
    router.replace('/(tabs)/home');
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
          A simple family access flow for the app. Register and sign in are design-only and do not
          enforce real backend authentication.
        </Text>

        <Surface style={styles.card} elevation={1}>
          <View style={styles.modeSwitcher}>
            <Button
              mode={isRegisterMode ? 'contained' : 'text'}
              buttonColor={isRegisterMode ? '#8B8DF1' : '#232325'}
              textColor={isRegisterMode ? '#18181B' : '#FFFFFF'}
              style={styles.modeButton}
              onPress={() => setMode('register')}>
              Register
            </Button>
            <Button
              mode={!isRegisterMode ? 'contained' : 'text'}
              buttonColor={!isRegisterMode ? '#8B8DF1' : '#232325'}
              textColor={!isRegisterMode ? '#18181B' : '#FFFFFF'}
              style={styles.modeButton}
              onPress={() => setMode('signin')}>
              Sign In
            </Button>
          </View>

          <Text variant="titleMedium" style={styles.cardTitle}>
            {isRegisterMode ? 'Create family access' : 'Welcome back'}
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            {isRegisterMode
              ? 'Create a simple local account to enter the family dashboard.'
              : 'Sign in with your phone number to reopen the dashboard.'}
          </Text>

          {isRegisterMode ? (
            <TextInput
              label="Full name"
              mode="outlined"
              autoCapitalize="words"
              textColor="#FFFFFF"
              outlineColor="#2D2D2D"
              activeOutlineColor="#8B8DF1"
              value={name}
              onChangeText={setName}
            />
          ) : null}

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

          {isRegisterMode ? (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              textColor="#FFFFFF"
              outlineColor="#2D2D2D"
              activeOutlineColor="#8B8DF1"
              value={password}
              onChangeText={setPassword}
            />
          ) : null}

          <Button
            mode="contained"
            buttonColor="#8B8DF1"
            textColor="#18181B"
            style={styles.submitButton}
            onPress={handleContinue}>
            {isRegisterMode ? 'Register' : 'Sign In'}
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            No real authentication is enforced. This only controls entry into the app UI.
          </Text>
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
  modeSwitcher: {
    backgroundColor: '#171717',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 6,
  },
  modeButton: {
    borderRadius: 12,
    flex: 1,
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
  hint: {
    color: '#7C7C87',
    lineHeight: 18,
  },
});
