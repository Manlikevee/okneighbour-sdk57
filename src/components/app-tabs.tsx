import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * Native system tab bar (liquid glass on iOS 26, Material 3 on Android).
 * Screens manage their own insets (see useTabInsets), so automatic content insets are disabled.
 */
export default function AppTabs() {
  const colors = useTheme();

  return (
    <NativeTabs
      tintColor={colors.link}
      iconColor={{ default: colors.textTertiary, selected: colors.link }}
      // Leave the iOS bar untouched so the system material shows through.
      backgroundColor={Platform.OS === 'android' ? colors.surface : undefined}
      indicatorColor={colors.primarySoft}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'safari', selected: 'safari.fill' }} md="explore" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="account_circle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
