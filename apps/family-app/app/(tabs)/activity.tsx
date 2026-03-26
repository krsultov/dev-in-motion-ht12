import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ActivityCard } from '@/components/activity-card';
import { ScreenShell } from '@/components/screen-shell';
import { activityItems } from '@/data/dummy';

const groupedActivity = {
  Today: activityItems.filter((item) => item.day === 'Today'),
  Yesterday: activityItems.filter((item) => item.day === 'Yesterday'),
};

export default function ActivityScreen() {
  // This screen renders the full assistant activity feed grouped by day.
  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        Activity
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        What the AI did for Maria.
      </Text>

      {(['Today', 'Yesterday'] as const).map((day) => (
        <View key={day} style={styles.group}>
          <Text variant="titleMedium" style={styles.groupTitle}>
            {day}
          </Text>
          {groupedActivity[day].map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </View>
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    marginBottom: 20,
    marginTop: 6,
  },
  group: {
    marginBottom: 8,
  },
  groupTitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
});
