import { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type MemoryRow = {
  id: string;
  label: string;
  detail: string;
  iconColor?: string;
};

type MemorySectionCardProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  rows: MemoryRow[];
  content?: ReactNode;
};

export function MemorySectionCard({
  title,
  iconName,
  accentColor,
  rows,
  content,
}: MemorySectionCardProps) {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        <IconButton
          icon={() => <Ionicons name="create-outline" size={20} color="#334155" />}
          onPress={() => Alert.alert('Editing coming soon')}
        />
      </View>

      {content ??
        rows.map((row, index) => (
          <View
            key={row.id}
            style={[styles.row, index === rows.length - 1 ? styles.lastRow : null]}>
            <View style={[styles.iconBadge, { backgroundColor: row.iconColor ?? accentColor }]}>
              <Ionicons name={iconName} size={16} color="#FFFFFF" />
            </View>
            <View style={styles.rowText}>
              <Text variant="bodyLarge" style={styles.primary}>
                {row.label}
              </Text>
              <Text variant="bodySmall" style={styles.secondary}>
                {row.detail}
              </Text>
            </View>
          </View>
        ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2D2D2D',
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
    padding: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  row: {
    alignItems: 'flex-start',
    borderBottomColor: '#2D2D2D',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  rowText: {
    flex: 1,
  },
  primary: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondary: {
    color: '#A1A1AA',
    lineHeight: 18,
    marginTop: 2,
  },
});
