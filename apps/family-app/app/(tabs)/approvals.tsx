import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { ApprovalCard } from '@/components/approval-card';
import { ScreenShell } from '@/components/screen-shell';
import { useApprovalFeed } from '@/hooks/useApprovalFeed';
import type { Approval, ApprovalStatus } from '@/types/api';

export default function ApprovalsScreen() {
  // This screen renders pending approval actions and lets the user resolve them locally.
  const { items, isLoading, isError } = useApprovalFeed();
  const [approvalItems, setApprovalItems] = useState<Approval[]>([]);

  useEffect(() => {
    setApprovalItems(items);
  }, [items]);

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
        {isLoading ? (
          <ActivityIndicator size="small" color="#8B8DF1" />
        ) : isError ? (
          <Text variant="bodyMedium" style={styles.emptyState}>
            Could not load data
          </Text>
        ) : pendingItems.length > 0 ? (
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
        {isLoading ? (
          <ActivityIndicator size="small" color="#8B8DF1" />
        ) : isError ? (
          <Text variant="bodyMedium" style={styles.emptyState}>
            Could not load data
          </Text>
        ) : completedItems.length > 0 ? (
          completedItems.map((item) => <ApprovalCard key={item.id} item={item} />)
        ) : (
          <Text variant="bodyMedium" style={styles.emptyState}>
            No completed approvals yet.
          </Text>
        )}
      </View>
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  emptyState: {
    color: '#A1A1AA',
  },
});
