import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Appearance } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { StorageKeys } from '@/constants/config';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getItem } from '@/lib/storage';
import { AppProviders } from '@/providers/app-providers';
import { useSession } from '@/providers/session-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const scheme = useColorScheme();
  const { status, verified } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  // Re-apply the person's saved light/dark choice (System by default).
  useEffect(() => {
    void getItem(StorageKeys.appearance).then((pref) => {
      if (pref === 'light' || pref === 'dark') Appearance.setColorScheme(pref);
    });
  }, []);

  // Keep the native splash up until fonts and the saved session are ready.
  if (!(fontsLoaded || fontError) || status === 'loading') return null;

  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: c.background, card: c.surface, text: c.text, border: c.border, primary: c.link, notification: c.danger },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={status === 'signedOut'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signedIn' && !verified}>
          <Stack.Screen name="complete-profile" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signedIn' && verified}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}
