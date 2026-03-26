import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import type { ActivityCategory, ApprovalStatus } from '@/data/dummy';

type StatusTagProps = {
  label: string;
  tone: ActivityCategory | ApprovalStatus;
};

const toneColors: Record<StatusTagProps['tone'], { backgroundColor: string; textColor: string }> = {
  calendar: { backgroundColor: '#F3E8FF', textColor: '#7C3AED' },
  call: { backgroundColor: '#DCFCE7', textColor: '#15803D' },
  search: { backgroundColor: '#FEF3C7', textColor: '#B45309' },
  purchase: { backgroundColor: '#DBEAFE', textColor: '#1D4ED8' },
  pending: { backgroundColor: '#FEF3C7', textColor: '#B45309' },
  approved: { backgroundColor: '#DCFCE7', textColor: '#15803D' },
  declined: { backgroundColor: '#FEE2E2', textColor: '#B91C1C' },
};

export function StatusTag({ label, tone }: StatusTagProps) {
  const colors = toneColors[tone];

  return (
    <Chip
      compact
      style={[styles.chip, { backgroundColor: colors.backgroundColor }]}
      textStyle={[styles.text, { color: colors.textColor }]}>
      {label}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 30,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
