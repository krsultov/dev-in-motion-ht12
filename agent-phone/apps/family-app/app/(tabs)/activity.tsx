import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ActivityCard } from '@/components/activity-card';
import { activityItems } from '@/data/dummy';

const groupedActivity = {
  Today: activityItems.filter((item) => item.day === 'Today'),
  Yesterday: activityItems.filter((item) => item.day === 'Yesterday'),
};

export default function ActivityScreen() {
  // This screen renders the full assistant activity feed grouped by day.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Assistant activity
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Calls, searches, bookings, and purchases made for Maria.
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
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
  group: {
    marginBottom: 8,
  },
  groupTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
});
