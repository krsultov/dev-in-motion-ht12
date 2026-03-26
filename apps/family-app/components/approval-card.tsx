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
            <Button
              mode="contained"
              buttonColor="#202020"
              labelStyle={styles.actionLabel}
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onUpdateStatus?.(item.id, 'approved')}>
              Approve
            </Button>
            <Button
              mode="outlined"
              labelStyle={styles.actionLabel}
              style={[styles.actionButton, styles.declineButton]}
              textColor="#FFFFFF"
              onPress={() => onUpdateStatus?.(item.id, 'declined')}>
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
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderRadius: 16,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#171717',
    opacity: 0.9,
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
  titleBlock: {
    flex: 1,
    flexShrink: 1,
    gap: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  description: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
  metaRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  amount: {
    color: '#F9E4D4',
    fontWeight: '700',
  },
  requestedAt: {
    color: '#A1A1AA',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  actionButton: {
    flex: 1,
  },
  actionLabel: {
    color: '#FFFFFF',
  },
  approveButton: {
    borderColor: '#D4F4E4',
    borderWidth: 1,
  },
  declineButton: {
    borderColor: '#F9D4D4',
  },
});
