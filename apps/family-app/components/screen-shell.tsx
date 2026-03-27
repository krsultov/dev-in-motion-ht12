import { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScreenShellProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ScreenShell({ children, contentContainerStyle, refreshing, onRefresh }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing ?? false}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              colors={['#FFFFFF']}
              progressBackgroundColor="#1E1E1E"
            />
          ) : undefined
        }>
        {children}
      </ScrollView>
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
    paddingBottom: 132,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
});
