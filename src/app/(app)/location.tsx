import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { searchPlaces } from '@/api/geocode';
import { Button } from '@/components/ui/button';
import { HeaderButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { placeSubtitle, type Place } from '@/lib/place';
import { showToast } from '@/lib/toast';
import { useLocation } from '@/providers/location-provider';

function PlaceRow({ place, active, onPress }: { place: Place; active?: boolean; onPress: () => void }) {
  const theme = useTheme();
  const subtitle = placeSubtitle(place);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${place.city}${subtitle ? `, ${subtitle}` : ''}${active ? ', current' : ''}`}
      style={[styles.row, { backgroundColor: theme.surface, borderColor: active ? theme.primary : theme.border, borderWidth: active ? 2 : 1 }]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.primarySoft }]}>
        <Icon name="location" size={18} tint={theme.onPrimarySoft} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="heading" numberOfLines={1} style={{ fontSize: 16 }}>
          {place.city}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {active ? <Icon name="check" size={18} color="link" /> : null}
    </PressableScale>
  );
}

export default function LocationScreen() {
  const { place, recents, permission, locateDevice, choosePlace, openSettings } = useLocation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const pick = (p: Place) => {
    choosePlace(p);
    showToast(`Showing ${p.city}`, 'success');
    router.back();
  };

  const search = async () => {
    if (query.trim().length < 2 || searching) return;
    setSearching(true);
    try {
      setResults(await searchPlaces(query));
    } catch (e) {
      showToast(getErrorMessage(e, 'Search failed. Please try again.'), 'error');
    } finally {
      setSearching(false);
    }
  };

  const useMine = async () => {
    setLocating(true);
    const ok = await locateDevice();
    setLocating(false);
    if (ok) router.back();
  };

  const others = recents.filter((r) => r.city.toLowerCase() !== place?.city.toLowerCase());

  return (
    <>
    <Stack.Screen options={{ headerRight: () => <HeaderButton label="Done" onPress={() => router.back()} /> }} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
      <ThemedText themeColor="textSecondary">Posts, events and news are tuned to the place you pick.</ThemedText>

      <Button title="Use my current location" icon="locationArrow" size="lg" fullWidth loading={locating} onPress={useMine} />
      {permission === 'blocked' ? (
        <View style={styles.blocked}>
          <ThemedText type="small" themeColor="textSecondary">
            Location access is off for OkNeighbour.
          </ThemedText>
          <Pressable onPress={openSettings} accessibilityRole="button" hitSlop={8}>
            <ThemedText type="link">Open settings</ThemedText>
          </Pressable>
        </View>
      ) : null}

      <View style={{ gap: Spacing.two }}>
        <TextField
          icon="search"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            if (!t) setResults(null);
          }}
          placeholder="Search a town or city"
          returnKeyType="search"
          onSubmitEditing={search}
          autoCorrect={false}
          right={searching ? <ActivityIndicator size="small" /> : undefined}
        />
        <Button title="Search" variant="secondary" size="sm" onPress={search} disabled={query.trim().length < 2} loading={searching} />
      </View>

      {results ? (
        <View style={{ gap: Spacing.two + 2 }}>
          <ThemedText type="eyebrow">Results</ThemedText>
          {results.length === 0 ? (
            <ThemedText themeColor="textSecondary">No places found. Try a different spelling or a nearby town.</ThemedText>
          ) : (
            results.map((r) => <PlaceRow key={`${r.city}-${r.latitude}`} place={r} active={r.city === place?.city} onPress={() => pick(r)} />)
          )}
        </View>
      ) : (
        <View style={{ gap: Spacing.two + 2 }}>
          {place ? (
            <>
              <ThemedText type="eyebrow">Current</ThemedText>
              <PlaceRow place={place} active onPress={() => router.back()} />
            </>
          ) : null}
          {others.length ? <ThemedText type="eyebrow" style={{ marginTop: Spacing.two }}>Recent</ThemedText> : null}
          {others.map((r) => (
            <PlaceRow key={r.city} place={r} onPress={() => pick(r)} />
          ))}
        </View>
      )}
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.six },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three - 2, borderRadius: Radius.md },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  blocked: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
});
