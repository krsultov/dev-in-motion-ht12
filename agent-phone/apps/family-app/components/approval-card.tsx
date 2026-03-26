import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import type { Approval, ApprovalStatus } from '@/data/dummy';

import { StatusTag } from './status-tag';

type ApprovalCardProps = {
  item: Approval;
  onUpdateStatus?: (id: string, status: ApprovalStatus) => void;
};

export function ApprovalCard({ item, onUpdateStatus }: ApprovalCardProps) {
  const isPending = item.status === 'pending';

  return (
    <Card mode="outlined" style={[styles.card, !isPending && styles.completedCard]}>
      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.titleBlock}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              {item.description}
            </Text>
          </View>
          {!isPending ? <StatusTag label={item.status} tone={item.status} /> : null}
        </View>

        <View style={styles.metaRow}>
          <Text variant="bodyLarge" style={styles.amount}>
            {item.amount} {item.currency}
          </Text>
          <Text variant="bodySmall" style={styles.requestedAt}>
            {item.requestedAt}
          </Text>
        </View>

        {isPending ? (
          <View style={styles.actions}>
            <Button mode="contained" onPress={() => onUpdateStatus?.(item.id, 'approved')}>
              Approve
            </Button>
            <Button mode="outlined" onPress={() => onUpdateStatus?.(item.id, 'declined')}>
              Decline
            </Button>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  completedCard: {
    opacity: 0.78,
  },
  content: {
    gap: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    color: '#475569',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    fontWeight: '700',
  },
  requestedAt: {
    color: '#64748B',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
