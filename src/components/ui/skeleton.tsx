import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Skeleton({ width = '100%', height = 14, radius = 8, style }: { width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const pulse = useSharedValue(0.55);
  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [pulse]);
  const animated = useAnimatedStyle(() => ({ opacity: pulse.get() }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: theme.skeleton }, animated, style]} />;
}

export function PostSkeleton() {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityLabel="Loading posts">
      <View style={styles.row}>
        <Skeleton width={44} height={44} radius={22} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="45%" height={14} />
          <Skeleton width="30%" height={11} />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Skeleton height={13} />
        <Skeleton height={13} />
        <Skeleton width="70%" height={13} />
      </View>
      <Skeleton height={180} radius={Radius.md} />
    </View>
  );
}

export function FeedSkeleton({ slow }: { slow?: boolean }) {
  return (
    <View style={{ gap: Spacing.three }}>
      <PostSkeleton />
      <PostSkeleton />
      {slow ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.slow}>
          Waking things up… the first load can take a moment.
        </ThemedText>
      ) : null}
    </View>
  );
}

export function CardRailSkeleton() {
  return (
    <View style={styles.rail}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} width={230} height={210} radius={Radius.lg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.two + 4, alignItems: 'center' },
  slow: { textAlign: 'center', paddingVertical: Spacing.two },
  rail: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.three },
});
