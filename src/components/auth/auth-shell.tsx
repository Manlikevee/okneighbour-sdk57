import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/ui/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Forest hero with the brand, over a rounded paper sheet that holds the form. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.flex, { backgroundColor: theme.forest }]}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { paddingTop: insets.top + Spacing.four }]}>
          <View style={[styles.orb, styles.orbA, { backgroundColor: theme.primary }]} />
          <View style={[styles.orb, styles.orbB, { backgroundColor: theme.primary }]} />
          <BrandMark size={44} wordmark onDark />
          <View style={{ gap: Spacing.two, marginTop: Spacing.five }}>
            <ThemedText type="display" style={{ color: theme.onForest }}>
              {title}
            </ThemedText>
            <ThemedText style={{ color: 'rgba(244,248,238,0.72)' }}>{subtitle}</ThemedText>
          </View>
        </View>
        <View style={[styles.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + Spacing.four }]}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six - 12, overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.12 },
  orbA: { width: 220, height: 220, top: -70, right: -60 },
  orbB: { width: 120, height: 120, top: 120, right: 70, opacity: 0.08 },
  sheet: { flexGrow: 1, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.four, gap: Spacing.three },
});
