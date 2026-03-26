import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar, Card, Surface, Text } from 'react-native-paper';

import { ActivityCard } from '@/components/activity-card';
import { StatusTag } from '@/components/status-tag';
import { activityItems, approvals, parentProfile } from '@/data/dummy';

export default function HomeScreen() {
  // This screen renders the family dashboard summary with profile, recent activity, and approval count.
  const router = useRouter();
  const recentItems = activityItems.slice(0, 2);
  const pendingCount = approvals.filter((item) => item.status === 'pending').length;

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Good morning, Ivan
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Here is a quick view of how Nelson is helping today.
      </Text>

      <Surface style={styles.heroCard} elevation={1}>
        <View style={styles.heroHeader}>
          <Avatar.Text size={54} label={parentProfile.initials} />
          <View style={styles.heroText}>
            <Text variant="titleLarge" style={styles.parentName}>
              {parentProfile.name}
            </Text>
            <Text variant="bodyMedium" style={styles.parentMeta}>
              {parentProfile.phone}
            </Text>
            <Text variant="bodySmall" style={styles.parentMeta}>
              Last active {parentProfile.lastActive}
            </Text>
          </View>
          <StatusTag
            label={parentProfile.aiActive ? 'AI active' : 'AI inactive'}
            tone={parentProfile.aiActive ? 'approved' : 'declined'}
          />
        </View>
      </Surface>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent activity
        </Text>
      </View>

      {recentItems.map((item) => (
        <ActivityCard key={item.id} item={item} />
      ))}

      <Card mode="outlined" style={styles.alertCard} onPress={() => router.push('/(tabs)/approvals')}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.alertTitle}>
            {pendingCount} approval {pendingCount === 1 ? 'request' : 'requests'} waiting
          </Text>
          <Text variant="bodyMedium" style={styles.alertSubtitle}>
            Review purchases and actions that need your confirmation.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 20,
    marginTop: 6,
  },
  heroCard: {
    borderRadius: 20,
    marginBottom: 22,
    padding: 18,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heroText: {
    flex: 1,
  },
  parentName: {
    fontWeight: '700',
  },
  parentMeta: {
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '700',
  },
  alertCard: {
    marginTop: 'auto',
  },
  alertTitle: {
    fontWeight: '700',
  },
  alertSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
});
