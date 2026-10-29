import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

export default function AppLayout() {
  const theme = useTheme();
  const header = {
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.background },
    headerTintColor: theme.text,
    headerTitleStyle: { fontFamily: 'Lexend_600SemiBold', fontSize: 17 },
    headerBackButtonDisplayMode: 'minimal' as const,
  };

  return (
    <Stack screenOptions={header}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[ref]" options={{ title: 'Post' }} />
      <Stack.Screen name="u/[ref]" options={{ title: '' }} />
      <Stack.Screen name="compose" options={{ title: 'New post', presentation: 'fullScreenModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: theme.background } }} />
      <Stack.Screen name="location" options={{ title: 'Choose location', presentation: 'modal', contentStyle: { backgroundColor: theme.background } }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit profile', presentation: 'fullScreenModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: theme.background } }} />
    </Stack>
  );
  
}
