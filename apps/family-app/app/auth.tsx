import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Surface, Text, TextInput } from 'react-native-paper';

import { useAuth } from '@/context/auth-context';

export default function AuthScreen() {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const { signIn } = useAuth();

  const handleContinue = () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      Alert.alert('Missing details', 'Enter your name and phone number to continue.');
      return;
    }

    signIn({ name: trimmedName, phone: trimmedPhone });
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
          Stay informed about how the AI assistant is helping your family member.
        </Text>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Family access
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            Sign in with your name and phone number to open the family dashboard.
          </Text>
          <TextInput
            label="Your name"
            mode="outlined"
            autoCapitalize="words"
            textColor="#FFFFFF"
            outlineColor="#2D2D2D"
            activeOutlineColor="#8B8DF1"
            value={name}
            onChangeText={setName}
          />
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
          <Button mode="contained" buttonColor="#8B8DF1" textColor="#18181B" onPress={handleContinue}>
            Continue
          </Button>
          <Text variant="bodySmall" style={styles.hint}>
            No verification code required.
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
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardText: {
    color: '#A1A1AA',
    lineHeight: 22,
  },
  hint: {
    color: '#7C7C87',
  },
});
