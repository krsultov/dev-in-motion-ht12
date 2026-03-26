import { Alert, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

type MemoryRow = {
  id: string;
  label: string;
  detail: string;
};

type MemorySectionCardProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  rows: MemoryRow[];
};

export function MemorySectionCard({
  title,
  iconName,
  accentColor,
  rows,
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

      {rows.map((row) => (
        <View key={row.id} style={styles.row}>
          <View style={[styles.iconBadge, { backgroundColor: accentColor }]}>
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
    fontWeight: '700',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
    fontWeight: '600',
  },
  secondary: {
    color: '#64748B',
    marginTop: 2,
  },
});
