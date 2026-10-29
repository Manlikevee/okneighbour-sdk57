import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="headline">Lost your way?</ThemedText>
        <ThemedText themeColor="textSecondary">That page doesn’t exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Back to home</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  link: { marginTop: Spacing.three, paddingVertical: Spacing.three },
});
