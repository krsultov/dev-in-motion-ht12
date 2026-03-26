import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { ActivityItem } from '@/types/api';

import { StatusTag } from './status-tag';

type ActivityCardProps = {
  item: ActivityItem;
};

export function ActivityCard({ item }: ActivityCardProps) {
  return (
    <Card mode="outlined" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title}>
            {item.title}
          </Text>
          <StatusTag label={item.category} tone={item.category} />
        </View>
        <Text variant="bodyMedium" style={styles.description}>
          {item.description}
        </Text>
        <Text variant="bodySmall" style={styles.timestamp}>
          {item.timestamp}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderRadius: 16,
    marginBottom: 12,
  },
  content: {
    gap: 10,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    flexGrow: 1,
    flexShrink: 1,
    fontWeight: '700',
  },
  description: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
  timestamp: {
    color: '#A1A1AA',
  },
});
