import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Surface, Text } from 'react-native-paper';

export default function AuthScreen() {
  const handleContinue = () => {
    console.log('[auth-screen] auth disabled for testing, continuing directly to home');
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
          Authentication is temporarily disabled so we can test live frontend rendering without any
          auth gate.
        </Text>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Auth disabled
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            The app now opens the tabs directly and will try to resolve the latest live family record
            from the backend for testing.
          </Text>

          <Button
            mode="contained"
            buttonColor="#8B8DF1"
            textColor="#18181B"
            style={styles.submitButton}
            onPress={handleContinue}>
            Open app
          </Button>

          <Text variant="bodySmall" style={styles.hint}>
            This screen is only a temporary bypass while we debug live data rendering.
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
  submitButton: {
    borderRadius: 14,
    marginTop: 4,
  },
  hint: {
    color: '#7C7C87',
    lineHeight: 18,
  },
});
