import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Card, Surface, Text } from 'react-native-paper';

import { HomeMonthCalendar } from '@/components/home-month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { StatusTag } from '@/components/status-tag';
import { useAuth } from '@/context/auth-context';
import { activityItems, approvals, calendarMonthActivities, parentProfile } from '@/data/dummy';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const recentItems = activityItems.slice(0, 2);
  const pendingCount = approvals.filter((item) => item.status === 'pending').length;
  const todayCount = activityItems.filter((item) => item.day === 'Today').length;

  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        Good morning, {user?.name ?? 'Family'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Your mother&apos;s assistant is active and keeping things on track.
      </Text>

      <Surface style={styles.heroCard} elevation={1}>
        <View style={styles.heroTopRow}>
          <Avatar.Text
            size={54}
            label={parentProfile.initials}
            labelStyle={styles.avatarLabel}
            style={styles.avatar}
          />
          <View style={styles.heroText}>
            <Text variant="titleLarge" style={styles.parentName}>
              {parentProfile.name}
            </Text>
            <Text variant="bodySmall" style={styles.parentMeta}>
              Last active: {parentProfile.lastActive}
            </Text>
          </View>
        </View>

        <View style={styles.heroTags}>
          <StatusTag
            label={parentProfile.aiActive ? 'AI active' : 'AI inactive'}
            tone={parentProfile.aiActive ? 'approved' : 'declined'}
          />
          <StatusTag label={`${todayCount} tasks today`} tone="calendar" />
        </View>
      </Surface>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent activity
        </Text>
      </View>

      <Card mode="outlined" style={styles.timelineCard}>
        <Card.Content style={styles.timelineContent}>
          {recentItems.map((item, index) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View
                  style={[styles.timelineDot, index === 1 ? styles.timelineDotSecondary : null]}
                />
                {index < recentItems.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineTextBlock}>
                <Text variant="titleSmall" style={styles.timelineTitle}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={styles.timelineDescription}>
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.alertCard} onPress={() => router.push('/(tabs)/approvals')}>
        <Card.Content style={styles.alertContent}>
          <View style={styles.alertText}>
            <Text variant="titleMedium" style={styles.alertTitle}>
              Pending approval
            </Text>
            <Text variant="bodyMedium" style={styles.alertSubtitle}>
              Review requests and purchases that need your confirmation.
            </Text>
          </View>
          <StatusTag label={`${pendingCount} pending`} tone="pending" />
          <Ionicons name="chevron-forward" size={18} color="#7C7893" />
        </Card.Content>
      </Card>

      <HomeMonthCalendar activities={calendarMonthActivities} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#A1A1AA',
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
    maxWidth: 320,
  },
  heroCard: {
    backgroundColor: '#CDCFFC',
    borderColor: '#CDCFFC',
    borderRadius: 22,
    marginBottom: 26,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    backgroundColor: '#B7BAF8',
  },
  avatarLabel: {
    color: '#23244D',
    fontWeight: '700',
  },
  heroText: {
    flex: 1,
  },
  parentName: {
    color: '#23244D',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  parentMeta: {
    color: '#4D4FA0',
    marginTop: 4,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
    borderRadius: 18,
    marginBottom: 16,
  },
  timelineContent: {
    gap: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    backgroundColor: '#8B8DF1',
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  timelineDotSecondary: {
    backgroundColor: '#D4F4E4',
  },
  timelineLine: {
    backgroundColor: '#2D2D2D',
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  timelineTextBlock: {
    flex: 1,
    paddingBottom: 2,
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 20,
  },
  timelineDescription: {
    color: '#A1A1AA',
    lineHeight: 18,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
    borderRadius: 18,
  },
  alertContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  alertSubtitle: {
    color: '#A1A1AA',
    lineHeight: 19,
    marginTop: 4,
  },
});
