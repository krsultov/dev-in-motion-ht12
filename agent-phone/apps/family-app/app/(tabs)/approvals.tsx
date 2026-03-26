import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ApprovalCard } from '@/components/approval-card';
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Approvals
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Review requests before the assistant completes sensitive actions.
      </Text>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Pending
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyState: {
    color: '#64748B',
  },
});
