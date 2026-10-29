import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fullName } from '@/lib/format';
import { useLocation } from '@/providers/location-provider';
import { useSession } from '@/providers/session-provider';

export function ComposerPrompt() {
  const theme = useTheme();
  const { profile, claims } = useSession();
  const { place } = useLocation();
  const name = fullName(profile?.user ?? { first_name: claims?.first_name, last_name: claims?.last_name, username: claims?.username });

  return (
    <PressableScale
      onPress={() => router.push('/compose')}
      accessibilityRole="button"
      accessibilityLabel={`Write a post${place ? ` for ${place.city}` : ''}`}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, boxShadow: Shadow.card }]}>
      <Avatar uri={profile?.profile_picture} name={name} size={40} />
      <ThemedText themeColor="textSecondary" style={{ flex: 1 }} numberOfLines={1}>
        {place ? `Share something with ${place.city}…` : 'Share something with your neighbours…'}
      </ThemedText>
      <View style={[styles.photo, { backgroundColor: theme.primarySoft }]}>
        <Icon name="photo" size={18} tint={theme.onPrimarySoft} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4, padding: Spacing.two + 4, paddingRight: Spacing.three, borderRadius: Radius.pill, borderWidth: 1 },
  photo: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
