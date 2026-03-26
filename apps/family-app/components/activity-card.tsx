import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { ActivityItem } from '@/data/dummy';

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
    borderColor: '#303038',
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  content: {
    gap: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFFFFF',
    flexGrow: 1,
    flexShrink: 1,
    fontWeight: '700',
    lineHeight: 22,
  },
  description: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
  timestamp: {
    color: '#8A8A96',
  },
});
