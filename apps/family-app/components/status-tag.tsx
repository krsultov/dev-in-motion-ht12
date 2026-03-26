import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';

import type { ActivityCategory, ApprovalStatus } from '@/data/dummy';

type StatusTagProps = {
  label: string;
  tone: ActivityCategory | ApprovalStatus;
};

const toneColors: Record<StatusTagProps['tone'], { backgroundColor: string; textColor: string }> = {
  calendar: { backgroundColor: '#CDCFFC', textColor: '#23244D' },
  call: { backgroundColor: '#D4F4E4', textColor: '#173D2C' },
  search: { backgroundColor: '#F9E4D4', textColor: '#5C3520' },
  purchase: { backgroundColor: '#CDCFFC', textColor: '#23244D' },
  pending: { backgroundColor: '#F9E4D4', textColor: '#5C3520' },
  approved: { backgroundColor: '#D4F4E4', textColor: '#173D2C' },
  declined: { backgroundColor: '#F9D4D4', textColor: '#5A2222' },
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
    alignSelf: 'flex-start',
    backgroundColor: '#2D2D2D',
    height: 30,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
