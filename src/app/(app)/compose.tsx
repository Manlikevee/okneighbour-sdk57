import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { createPost } from '@/api/posts';
import type { LocalFile } from '@/api/types';
import { RichEditor } from '@/components/compose/rich-editor';
import { Avatar } from '@/components/ui/avatar';
import { HeaderButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { POST_MAX_IMAGES, POST_MAX_LENGTH, POST_MIN_LENGTH } from '@/constants/config';
import { Radius, Spacing } from '@/constants/theme';
import { useHeaderOffset } from '@/hooks/use-header-offset';
import { useTheme } from '@/hooks/use-theme';
import { bumpContentVersion } from '@/lib/content-version';
import { fullName } from '@/lib/format';
import { htmlToPlainText } from '@/lib/html';
import { pickImages } from '@/lib/pick-image';
import { showToast } from '@/lib/toast';
import { useLocation } from '@/providers/location-provider';
import { useSession } from '@/providers/session-provider';

export default function ComposeScreen() {
  const theme = useTheme();
  const offset = useHeaderOffset();
  const { place } = useLocation();
  const { profile, claims } = useSession();
  const [html, setHtml] = useState('');
  const [images, setImages] = useState<LocalFile[]>([]);
  const [posting, setPosting] = useState(false);

  const length = htmlToPlainText(html).length;
  const tooShort = length < POST_MIN_LENGTH;
  const tooLong = length > POST_MAX_LENGTH;
  const canPost = !!place && !tooShort && !tooLong;
  const name = fullName(profile?.user ?? { first_name: claims?.first_name, last_name: claims?.last_name, username: claims?.username });

  const onChangeHtml = useCallback((v: string) => setHtml(v), []);

  const cancel = () => {
    if (length === 0 && images.length === 0) {
      router.back();
      return;
    }
    Alert.alert('Discard this post?', 'What you’ve written won’t be saved.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const addPhotos = async () => {
    const remaining = POST_MAX_IMAGES - images.length;
    if (remaining <= 0) return;
    const picked = await pickImages({ limit: remaining });
    if (picked.length) setImages((cur) => [...cur, ...picked].slice(0, POST_MAX_IMAGES));
  };

  const submit = async () => {
    if (!place || !canPost || posting) return;
    setPosting(true);
    try {
      await createPost({ content: html, location: place.city, images });
      bumpContentVersion();
      showToast(`Posted to ${place.city}`, 'success');
      router.back();
    } catch (e) {
      showToast(getErrorMessage(e, 'Couldn’t publish your post. Please try again.'), 'error');
      setPosting(false);
    }
  };

  const hint = !place ? 'Choose a location to post' : tooShort && length > 0 ? `${POST_MIN_LENGTH - length} more to go` : '';

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Cancel" onPress={cancel} disabled={posting} />,
          headerRight: () => <HeaderButton label="Post" primary onPress={submit} disabled={!canPost} loading={posting} />,
        }}
      />

      <View style={styles.top}>
        <View style={styles.author}>
          <Avatar uri={profile?.profile_picture} name={name} size={40} />
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText type="heading" numberOfLines={1} style={{ fontSize: 16 }}>
              {name}
            </ThemedText>
            <PressableScale
              onPress={() => router.push('/location')}
              accessibilityRole="button"
              accessibilityLabel={`Posting to ${place?.city ?? 'no location'}. Change`}
              style={[styles.place, { backgroundColor: theme.primarySoft }]}>
              <Icon name="location" size={13} tint={theme.onPrimarySoft} />
              <ThemedText type="caption" style={{ color: theme.onPrimarySoft }}>
                {place ? `Posting to ${place.city}` : 'Choose location'}
              </ThemedText>
              <Icon name="chevronDown" size={11} tint={theme.onPrimarySoft} />
            </PressableScale>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="small" style={{ color: tooLong ? theme.danger : theme.textSecondary }} accessibilityLiveRegion="polite">
              {length}/{POST_MAX_LENGTH}
            </ThemedText>
            {hint ? <ThemedText type="caption">{hint}</ThemedText> : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos} keyboardShouldPersistTaps="handled">
          <PressableScale
            onPress={addPhotos}
            disabled={images.length >= POST_MAX_IMAGES}
            accessibilityRole="button"
            accessibilityLabel={`Add photos, ${images.length} of ${POST_MAX_IMAGES} added`}
            style={[styles.addPhoto, { backgroundColor: theme.surface, borderColor: theme.border, opacity: images.length >= POST_MAX_IMAGES ? 0.4 : 1 }]}>
            <Icon name="photo" size={22} color="link" />
            <ThemedText type="caption">
              {images.length}/{POST_MAX_IMAGES}
            </ThemedText>
          </PressableScale>
          {images.map((img, i) => (
            <View key={img.uri} style={styles.thumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" accessibilityLabel={`Photo ${i + 1}`} />
              <PressableScale
                onPress={() => setImages((cur) => cur.filter((x) => x.uri !== img.uri))}
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i + 1}`}
                style={[styles.remove, { backgroundColor: theme.forest }]}>
                <Icon name="close" size={11} tint="#F4F8EE" />
              </PressableScale>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.flex}>
        <RichEditor onChangeHtml={onChangeHtml} overLimit={tooLong} keyboardOffset={offset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.three },
  author: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two + 4 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  photos: { gap: Spacing.two + 2, paddingVertical: 2 },
  addPhoto: { width: 64, height: 64, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  thumbWrap: { width: 64, height: 64 },
  thumb: { width: 64, height: 64, borderRadius: Radius.md },
  remove: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
