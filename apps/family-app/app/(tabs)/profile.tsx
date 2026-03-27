import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Text,
  Surface,
} from "react-native-paper";

import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/context/auth-context";
import { buildElderProfile } from "@/lib/dashboard-data";
import { getCurrentUserMemory } from "@/lib/memory-api";
import type { UserMemoryRecord } from "@/types/memory";

const familyAccountProfile = {
  name: "Член на семейството",
  permissionLevel: "Локален достъп до приложението",
  relationshipLabel: "Член на семейството",
};

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMemory = async () => {
      if (!user?.phone) {
        setMemoryRecord(null);
        setErrorMessage(
          "Влезте с телефонен номер, за да заредите профила в реално време.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const record = await getCurrentUserMemory(user.phone);

        if (isMounted) {
          setMemoryRecord(record);
          setErrorMessage(null);
        }
      } catch (error) {
        if (isMounted) {
          setMemoryRecord(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Профилът в реално време не може да бъде зареден в момента.",
          );
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
  }, [user?.phone]);

  const elderProfile = useMemo(
    () => buildElderProfile(memoryRecord, user?.phone ?? null),
    [memoryRecord, user?.phone],
  );

  const handleSignOut = () => {
    signOut();
    router.replace("/auth");
  };

  return (
    <ScreenShell contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        Профил
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Семеен достъп, контекст за грижа и настройки за известия.
      </Text>

      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Профил на близкия
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

          {isLoading ? (
            <Surface style={styles.statePanel} elevation={0}>
              <Text variant="bodyMedium" style={styles.stateText}>
                Зареждане на профилните данни в реално време.
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
                Все още няма запис за профил в реално време за този телефонен номер.
              </Text>
            </Surface>
          ) : null}

          <View style={styles.chipRow}>
            <Chip
              compact
              style={[
                styles.infoChip,
                memoryRecord?.subscription
                  ? styles.subscriptionChipActive
                  : styles.subscriptionChipInactive,
              ]}
              textStyle={
                memoryRecord?.subscription
                  ? styles.subscriptionChipActiveText
                  : styles.subscriptionChipInactiveText
              }
            >
              {memoryRecord?.subscription ? "Абониран" : "Не е абониран"}
            </Chip>
            <Chip
              compact
              style={[styles.infoChip, styles.languageChip]}
              textStyle={styles.darkChipText}
            >
              {memoryRecord ? `${memoryRecord.memories.length} бележки за памет` : "Все още няма бележки за памет"}
            </Chip>
          </View>

          {memoryRecord ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Бележки за памет
                </Text>
                <Text variant="titleMedium" style={styles.statValue}>
                  {memoryRecord.memories.length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Последно обновяване
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
            Вашият акаунт
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
                {user?.name ?? familyAccountProfile.name}
              </Text>
              <Text variant="bodyMedium" style={styles.profileMeta}>
                Вход само през приложението
              </Text>
            </View>
          </View>

          <View style={styles.footerBlock}>
            <Text variant="bodySmall" style={styles.footerLabel}>
              Ниво на достъп
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
            Изход
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
  subscriptionChipActive: {
    backgroundColor: "#D4F4E4",
  },
  subscriptionChipInactive: {
    backgroundColor: "#2D2D2D",
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
  subscriptionChipActiveText: {
    color: "#173D2C",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subscriptionChipInactiveText: {
    color: "#F4F4F5",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
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
