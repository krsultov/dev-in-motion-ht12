import { format, parseISO } from 'date-fns';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

import { ActivityCard } from '@/components/activity-card';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { groupByDay } from '@/lib/groupByDay';
import type { ActivityItem } from '@/types/api';

type ActivityListRow =
  | { type: 'header'; id: string; label: string }
  | { type: 'item'; id: string; item: ActivityItem };

function getDisplayTimestamp(timestamp: string) {
  const parsed = parseISO(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return format(parsed, 'h:mm a');
}

export default function ActivityScreen() {
  // This screen renders the full assistant activity feed grouped by day.
  const { items, isLoading, isError, hasMore, fetchNextPage, isFetchingNextPage } =
    useActivityFeed();
  const grouped = groupByDay(items);
  const rows = grouped.flatMap<ActivityListRow>((group) => [
    { type: 'header', id: `header-${group.label}`, label: group.label },
    ...group.data.map((item) => ({
      type: 'item' as const,
      id: item.id,
      item: {
        ...item,
        timestamp: getDisplayTimestamp(item.timestamp),
      },
    })),
  ]);
  const stickyHeaderIndices = rows
    .map((row, index) => (row.type === 'header' ? index : -1))
    .filter((index) => index !== -1);

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B8DF1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        stickyHeaderIndices={stickyHeaderIndices}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text variant="headlineSmall" style={styles.title}>
              Activity
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              What the AI did for Maria.
            </Text>
            {isError ? (
              <Text variant="bodySmall" style={styles.errorText}>
                Could not load activity
              </Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text variant="bodySmall" style={styles.emptyText}>
              No activity yet
            </Text>
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color="#8B8DF1" />
            </View>
          ) : hasMore ? (
            <View style={styles.footer}>
              <Button mode="text" onPress={fetchNextPage}>
                Load more
              </Button>
            </View>
          ) : null
        }
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <View style={styles.headerSticky}>
              <View style={styles.group}>
                <Text variant="titleMedium" style={styles.groupTitle}>
                  {item.label}
                </Text>
              </View>
            </View>
          ) : (
            <ActivityCard item={item.item} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#121212',
    flex: 1,
  },
  content: {
    backgroundColor: '#121212',
    flexGrow: 1,
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
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
  headerSticky: {
    backgroundColor: '#121212',
  },
  groupTitle: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: '#A1A1AA',
    marginBottom: 12,
  },
  emptyText: {
    color: '#A1A1AA',
  },
  footer: {
    paddingBottom: 12,
    paddingTop: 4,
  },
});
