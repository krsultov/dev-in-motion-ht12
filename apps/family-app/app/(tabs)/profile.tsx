import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Surface,
  Switch,
  Text,
} from "react-native-paper";

import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/context/auth-context";
import { buildElderProfile } from "@/lib/dashboard-data";
import {
  getCurrentUserMemory,
  getLatestUserMemoryRecord,
} from "@/lib/memory-api";
import type { UserMemoryRecord } from "@/types/memory";

const familyAccountProfile = {
  name: "Family member",
  notificationPreferences: [
    { id: "purchases", label: "Purchases", enabled: true },
    { id: "wellness-alerts", label: "Wellness Alerts", enabled: true },
    { id: "unusual-activity", label: "Unusual Activity", enabled: false },
  ],
  permissionLevel: "Local Frontend Access",
  relationshipLabel: "Family member",
};

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const userName = user?.name ?? null;
  const userPhone = user?.phone ?? null;
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedPhone, setResolvedPhone] = useState<string | null>(userPhone);
  const [resolvedUserName, setResolvedUserName] = useState<string | null>(
    userName,
  );
  const [notificationPreferences, setNotificationPreferences] = useState(
    familyAccountProfile.notificationPreferences,
  );

  useEffect(() => {
    let isMounted = true;

    const loadMemory = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        console.log("[profile-screen] loadMemory:start", { user });
        const fallbackRecord = !userPhone
          ? await getLatestUserMemoryRecord()
          : null;
        const activePhone =
          userPhone?.trim() || fallbackRecord?.phone?.trim() || "";
        const record = activePhone
          ? await getCurrentUserMemory(activePhone)
          : fallbackRecord;

        if (isMounted) {
          console.log("[profile-screen] loadMemory:resolved", {
            activePhone,
            fallbackRecord,
            record,
          });
          setResolvedPhone(activePhone || null);
          setResolvedUserName(
            (userName?.trim() || record?.name) ?? "Family member",
          );
          setMemoryRecord(record);
          setErrorMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setMemoryRecord(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load the live profile right now.",
          );
          console.log("[profile-screen] loadMemory:failed", { error });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadMemory();

    return () => {
      isMounted = false;
    };
  }, [user, userName, userPhone]);

  useEffect(() => {
    console.log("[profile-screen] render state", {
      errorMessage,
      isLoading,
      memoryRecord,
      resolvedPhone,
      resolvedUserName,
    });
  }, [errorMessage, isLoading, memoryRecord, resolvedPhone, resolvedUserName]);

  const elderProfile = useMemo(
    () => buildElderProfile(memoryRecord, resolvedPhone),
    [memoryRecord, resolvedPhone],
  );

  const handleToggle = (id: string) => {
    setNotificationPreferences((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const handleSignOut = () => {
    console.log("[profile-screen] sign out tapped while auth is disabled");
    signOut();
    router.replace("/(tabs)/home");
  };

  return (
    <ScreenShell contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Profile
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Family access, care context, and notification settings.
      </Text>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Elder profile
          </Text>

          <View style={styles.profileHeader}>
            <Avatar.Text
              size={72}
              label={elderProfile.initials}
              labelStyle={styles.avatarLabel}
              style={styles.primaryAvatar}
            />
            <View style={styles.profileCopy}>
              <Text variant="titleLarge" style={styles.profileName}>
                {elderProfile.name}
              </Text>
              <Text variant="bodyMedium" style={styles.profileMeta}>
                {elderProfile.phone}
              </Text>
            </View>
          </View>

          <Text variant="bodyMedium" style={styles.bio}>
            This section is now driven by the live user memory record. Extra
            profile fields like age, city, and bio do not exist in the backend
            yet.
          </Text>

          {isLoading ? (
            <Surface style={styles.statePanel} elevation={0}>
              <Text variant="bodyMedium" style={styles.stateText}>
                Loading live profile data.
              </Text>
            </Surface>
          ) : null}

          {!isLoading && errorMessage ? (
            <Surface style={styles.statePanel} elevation={0}>
              <Text variant="bodyMedium" style={styles.stateText}>
                {errorMessage}
              </Text>
            </Surface>
          ) : null}

          {!isLoading && !errorMessage && !memoryRecord ? (
            <Surface style={styles.statePanel} elevation={0}>
              <Text variant="bodyMedium" style={styles.stateText}>
                No live profile record exists for this phone number yet.
              </Text>
            </Surface>
          ) : null}

          <View style={styles.chipRow}>
            <Chip
              compact
              style={[styles.infoChip, styles.languageChip]}
              textStyle={styles.darkChipText}
            >
              {memoryRecord && memoryRecord.preferences.length > 0
                ? `${memoryRecord.preferences.length} preferences`
                : "No preferences yet"}
            </Chip>
            <Chip
              compact
              style={[styles.infoChip, styles.livingChip]}
              textStyle={styles.lightChipText}
            >
              {memoryRecord && memoryRecord.medications.length > 0
                ? `${memoryRecord.medications.length} medications`
                : "No medications yet"}
            </Chip>
            <Chip
              compact
              style={[styles.infoChip, styles.relationshipChip]}
              textStyle={styles.darkChipText}
            >
              {memoryRecord && memoryRecord.contacts.length > 0
                ? `${memoryRecord.contacts.length} contacts`
                : "No contacts yet"}
            </Chip>
          </View>

          {memoryRecord ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Memory notes
                </Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {memoryRecord.memories.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Last update
                </Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {elderProfile.lastUpdatedLabel}
                </Text>
              </View>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your account
          </Text>

          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label="IA"
              labelStyle={styles.secondaryAvatarLabel}
              style={styles.secondaryAvatar}
            />
            <View style={styles.profileCopy}>
              <Text variant="titleLarge" style={styles.profileName}>
                {resolvedUserName ?? familyAccountProfile.name}
              </Text>
              <Text variant="bodyMedium" style={styles.profileMeta}>
                Authentication disabled for testing
              </Text>
            </View>
          </View>

          <Surface style={styles.preferencesPanel} elevation={0}>
            <Text variant="titleSmall" style={styles.preferencesTitle}>
              Notification preferences
            </Text>

            {notificationPreferences.map((item, index) => (
              <View key={item.id}>
                <View style={styles.preferenceRow}>
                  <Text variant="bodyLarge" style={styles.preferenceLabel}>
                    {item.label}
                  </Text>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => handleToggle(item.id)}
                    color="#8B8DF1"
                  />
                </View>
                {index < notificationPreferences.length - 1 ? (
                  <Divider style={styles.preferenceDivider} />
                ) : null}
              </View>
            ))}
          </Surface>

          <View style={styles.footerBlock}>
            <Text variant="bodySmall" style={styles.footerLabel}>
              Permission level
            </Text>
            <Chip
              compact
              style={styles.permissionBadge}
              textStyle={styles.permissionText}
            >
              {familyAccountProfile.permissionLevel}
            </Chip>
          </View>

          <Button
            mode="contained"
            buttonColor="#232325"
            textColor="#FFFFFF"
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#A1A1AA",
    lineHeight: 21,
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 22,
  },
  cardContent: {
    gap: 18,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  profileCopy: {
    flex: 1,
    gap: 4,
  },
  primaryAvatar: {
    backgroundColor: "#CDCFFC",
  },
  secondaryAvatar: {
    backgroundColor: "#D4F4E4",
  },
  avatarLabel: {
    color: "#23244D",
    fontWeight: "700",
  },
  secondaryAvatarLabel: {
    color: "#173D2C",
    fontWeight: "700",
  },
  profileName: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  profileMeta: {
    color: "#A1A1AA",
  },
  bio: {
    color: "#CFCFD6",
    lineHeight: 22,
  },
  statePanel: {
    backgroundColor: "#171717",
    borderColor: "#26262C",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  stateText: {
    color: "#A1A1AA",
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    backgroundColor: "#171717",
    borderColor: "#26262C",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 14,
  },
  statLabel: {
    color: "#8A8A96",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoChip: {
    borderRadius: 999,
  },
  languageChip: {
    backgroundColor: "#CDCFFC",
  },
  livingChip: {
    backgroundColor: "#2D2D2D",
  },
  relationshipChip: {
    backgroundColor: "#F9E4D4",
  },
  darkChipText: {
    color: "#23244D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  lightChipText: {
    color: "#F4F4F5",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  preferencesPanel: {
    backgroundColor: "#171717",
    borderColor: "#26262C",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  preferencesTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 10,
  },
  preferenceRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
  },
  preferenceLabel: {
    color: "#E4E4E7",
    flex: 1,
    marginRight: 16,
  },
  preferenceDivider: {
    backgroundColor: "#2D2D2D",
  },
  footerBlock: {
    gap: 8,
  },
  footerLabel: {
    color: "#8A8A96",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  permissionBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#CDCFFC",
    borderRadius: 999,
  },
  permissionText: {
    color: "#23244D",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  signOutButton: {
    borderRadius: 16,
    marginTop: 4,
  },
});
