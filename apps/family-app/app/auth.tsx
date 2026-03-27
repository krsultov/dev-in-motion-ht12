import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import { Button, Surface, Text, TextInput } from "react-native-paper";

import { useAuth } from "@/context/auth-context";

const DEMO_OTP = "123456";

export default function AuthScreen() {
  const [phone, setPhone] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleRequestOtp = async () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      Alert.alert("Missing details", "Enter your phone number to continue.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setIsOtpSent(true);
      Alert.alert("Code sent", `Use ${DEMO_OTP} to continue in this demo.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedPhone = phone.trim();
    const normalizedOtp = otpCode.replace(/\D/g, "");

    if (normalizedOtp.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (normalizedOtp !== DEMO_OTP) {
        Alert.alert("Incorrect code", "Use the demo code shown after sending.");
        return;
      }

      signIn({ name: "Family member", phone: trimmedPhone });
      router.replace("/(tabs)/home");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleChangePhone = () => {
    setIsOtpSent(false);
    setOtpCode("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.blob, styles.blobPrimary]} />
        <View style={[styles.blob, styles.blobSecondary]} />
        <View style={[styles.blob, styles.blobTertiary]} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroBlock}>
          <View style={styles.kickerBadge}>
            <Text variant="bodySmall" style={styles.kickerText}>
              Family access
            </Text>
          </View>
          <Text variant="headlineLarge" style={styles.title}>
            Welcome to Nelson Family app!
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in with the linked phone number to open the live family
            dashboard.
          </Text>
        </View>

        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {isOtpSent ? "Verify your code" : "Sign in"}
          </Text>
          <Text variant="bodyMedium" style={styles.cardText}>
            {isOtpSent
              ? `Enter the 6-digit code sent to ${phone.trim()}.`
              : "Enter the linked phone number to receive a one-time code."}
          </Text>

          {!isOtpSent ? (
            <View style={styles.fieldBlock}>
              <Text variant="bodySmall" style={styles.fieldLabel}>
                Phone number
              </Text>
              <TextInput
                label="Linked phone"
                placeholder="+359 888 000 0002"
                mode="outlined"
                keyboardType="phone-pad"
                textColor="#FFFFFF"
                placeholderTextColor="#6B6B76"
                outlineColor="#2D2D2D"
                activeOutlineColor="#8B8DF1"
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { background: "#171717" } }}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          ) : (
            <View style={styles.fieldBlock}>
              <Text variant="bodySmall" style={styles.fieldLabel}>
                Verification code
              </Text>
              <TextInput
                label="6-digit code"
                placeholder="123456"
                mode="outlined"
                keyboardType="number-pad"
                textColor="#FFFFFF"
                placeholderTextColor="#6B6B76"
                outlineColor="#2D2D2D"
                activeOutlineColor="#8B8DF1"
                style={styles.input}
                contentStyle={styles.inputContent}
                outlineStyle={styles.inputOutline}
                theme={{ colors: { background: "#171717" } }}
                value={otpCode}
                onChangeText={handleOtpChange}
              />
              <View style={styles.otpMetaRow}>
                <Text variant="bodySmall" style={styles.helperText}>
                  Demo code: {DEMO_OTP}
                </Text>
                <Pressable onPress={handleChangePhone}>
                  <Text variant="bodySmall" style={styles.changePhoneText}>
                    Change phone
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <Button
            mode="contained"
            buttonColor="#8B8DF1"
            textColor="#18181B"
            style={styles.submitButton}
            loading={isLoading}
            disabled={isLoading}
            onPress={() =>
              void (isOtpSent ? handleVerifyOtp() : handleRequestOtp())
            }
          >
            {isOtpSent ? "Verify and continue" : "Send code"}
          </Button>

          {isOtpSent ? (
            <Button
              mode="text"
              textColor="#CDCFFC"
              disabled={isLoading}
              onPress={() => void handleRequestOtp()}
            >
              Resend code
            </Button>
          ) : null}
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blob: {
    elevation: 24,
    opacity: 0.4,
    position: "absolute",
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 80,
  },
  blobPrimary: {
    backgroundColor: "rgba(205, 207, 252, 0.18)",
    height: 320,
    right: -110,
    shadowColor: "#CDCFFC",
    top: 40,
    width: 320,
  },
  blobSecondary: {
    backgroundColor: "rgba(212, 244, 228, 0.14)",
    height: 280,
    left: -120,
    shadowColor: "#D4F4E4",
    top: 260,
    width: 280,
  },
  blobTertiary: {
    backgroundColor: "rgba(139, 141, 241, 0.14)",
    bottom: 70,
    height: 260,
    right: -40,
    shadowColor: "#8B8DF1",
    width: 260,
  },
  content: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    padding: 24,
  },
  heroBlock: {
    gap: 12,
    marginBottom: 8,
  },
  kickerBadge: {
    alignSelf: "center",
    backgroundColor: "#CDCFFC",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  kickerText: {
    color: "#23244D",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  title: {
    textAlign: "center",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    fontWeight: "700",
  },
  subtitle: {
    color: "#A1A1AA",
    lineHeight: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  cardText: {
    color: "#A1A1AA",
    lineHeight: 22,
  },
  fieldBlock: {
    gap: 8,
  },
  otpMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fieldLabel: {
    color: "#8A8A96",
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#171717",
    borderRadius: 22,
  },
  inputContent: {
    paddingVertical: 8,
  },
  inputOutline: {
    borderRadius: 22,
  },
  helperText: {
    color: "#8A8A96",
  },
  changePhoneText: {
    color: "#CDCFFC",
    fontWeight: "700",
  },
  submitButton: {
    borderRadius: 18,
    marginTop: 6,
  },
});
