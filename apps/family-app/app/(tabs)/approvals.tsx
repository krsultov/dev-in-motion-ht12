import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ApprovalCard } from '@/components/approval-card';
import { ScreenShell } from '@/components/screen-shell';
import { approvals, type ApprovalStatus } from '@/data/dummy';

export default function ApprovalsScreen() {
  // This screen renders pending approval actions and lets the user resolve them locally.
  const [approvalItems, setApprovalItems] = useState(approvals);

  const handleUpdateStatus = (id: string, status: ApprovalStatus) => {
    setApprovalItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const pendingItems = approvalItems.filter((item) => item.status === 'pending');
  const completedItems = approvalItems.filter((item) => item.status !== 'pending');

  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        Approvals
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Actions waiting for your OK.
      </Text>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Pending | {pendingItems.length}
        </Text>
        {pendingItems.length > 0 ? (
          pendingItems.map((item) => (
            <ApprovalCard key={item.id} item={item} onUpdateStatus={handleUpdateStatus} />
          ))
        ) : (
          <Text variant="bodyMedium" style={styles.emptyState}>
            No pending approvals right now.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Completed
        </Text>
        {completedItems.map((item) => (
          <ApprovalCard key={item.id} item={item} />
        ))}
      </View>
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
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  emptyState: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
