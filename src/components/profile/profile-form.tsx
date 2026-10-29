import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getErrorMessage, isAuthError, refreshAccessToken } from '@/api/client';
import { getMyProfile, saveProfile } from '@/api/profiles';
import type { LocalFile } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { DEFAULT_BIO_URL } from '@/constants/config';
import { Radius, Spacing } from '@/constants/theme';
import { useHeaderOffset } from '@/hooks/use-header-offset';
import { useResource } from '@/hooks/use-resource';
import { useTheme } from '@/hooks/use-theme';
import { bumpContentVersion } from '@/lib/content-version';
import { mediaUrl } from '@/lib/media';
import { pickImages } from '@/lib/pick-image';
import { showToast } from '@/lib/toast';
import { useLocation } from '@/providers/location-provider';
import { useSession } from '@/providers/session-provider';

type Values = {
  first_name: string; last_name: string; username: string; email: string; bio: string; profession: string;
  phone_number: string; bio_url: string; address: string; location: string; postal_code: string; gender: string;
};
const EMPTY: Values = { first_name: '', last_name: '', username: '', email: '', bio: '', profession: '', phone_number: '', bio_url: '', address: '', location: '', postal_code: '', gender: '' };
const GENDERS = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

/** `create` completes a new account's profile (photos required); `edit` updates an existing one. */
export function ProfileForm({ mode }: { mode: 'create' | 'edit' }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const offset = useHeaderOffset();
  const { claims, refreshProfile, markVerified, signOut, reloadClaims } = useSession();
  const { place } = useLocation();
  const existing = useResource('profile:form', getMyProfile);
  const [v, setV] = useState<Values>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [avatar, setAvatar] = useState<LocalFile | null>(null);
  const [cover, setCover] = useState<LocalFile | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Values | 'avatar' | 'cover', string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refs = useRef<Record<string, TextInput | null>>({});

  const profile = existing.data?.profile;

  // Prefill once from the server (plus the detected place for brand-new profiles).
  useEffect(() => {
    if (loaded || !existing.data) return;
    const p = existing.data.profile;
    setV({
      first_name: p?.user?.first_name ?? claims?.first_name ?? '',
      last_name: p?.user?.last_name ?? claims?.last_name ?? '',
      username: p?.user?.username ?? claims?.username ?? '',
      email: p?.email ?? p?.user?.email ?? '',
      bio: p?.bio ?? '',
      profession: p?.profession ?? '',
      phone_number: p?.phone_number ?? '',
      bio_url: p?.bio_url && p.bio_url !== DEFAULT_BIO_URL ? p.bio_url : '',
      address: p?.address ?? place?.displayName ?? '',
      location: p?.location ?? place?.city ?? '',
      postal_code: p?.postal_code ?? place?.postCode ?? '',
      gender: p?.gender ?? '',
    });
    setLoaded(true);
  }, [existing.data, loaded, claims, place]);

  // Accounts completed on a previous launch can carry a stale "not verified" token. Refresh it, or ask to log in again.
  useEffect(() => {
    if (mode !== 'create' || !profile?.is_verified || claims?.is_verified) return;
    (async () => {
      try {
        await refreshAccessToken();
        const next = await reloadClaims();
        if (next?.is_verified) return;
      } catch (e) {
        if (!isAuthError(e)) return;
      }
      await signOut('Your profile is complete. Please log in again to continue.');
    })();
  }, [mode, profile?.is_verified, claims?.is_verified, reloadClaims, signOut]);

  const set = (k: keyof Values) => (t: string) => setV((cur) => ({ ...cur, [k]: t }));
  const next = (k: string) => () => refs.current[k]?.focus();
  const reg = (k: string) => (r: TextInput | null) => {
    refs.current[k] = r;
  };

  const choose = async (kind: 'avatar' | 'cover') => {
    const [file] = await pickImages({ limit: 1, aspect: kind === 'avatar' ? [1, 1] : [16, 9] });
    if (!file) return;
    (kind === 'avatar' ? setAvatar : setCover)(file);
    setErrors((e) => ({ ...e, [kind]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    const req: (keyof Values)[] = ['first_name', 'last_name', 'email', 'bio', 'profession', 'phone_number', 'address', 'location', 'postal_code', 'gender'];
    for (const k of req) if (!v[k].trim()) e[k] = 'Required';
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = 'Enter a valid email address';
    if (mode === 'create') {
      if (!avatar && !profile?.profile_picture) e.avatar = 'Add a profile photo';
      if (!cover && !profile?.cover_photo) e.cover = 'Add a cover photo';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    setFormError(null);
    try {
      await saveProfile({
        first_name: v.first_name.trim(),
        last_name: v.last_name.trim(),
        username: v.username,
        email: v.email.trim(),
        bio: v.bio.trim(),
        profession: v.profession.trim(),
        phone_number: v.phone_number.trim(),
        bio_url: v.bio_url.trim() || DEFAULT_BIO_URL,
        address: v.address.trim(),
        location: v.location.trim(),
        postal_code: v.postal_code.trim(),
        gender: v.gender.trim(),
        profile_picture: avatar,
        cover_photo: cover,
      });
      await refreshProfile();
      bumpContentVersion();
      if (mode === 'create') {
        showToast('Welcome to OkNeighbour!', 'success');
        markVerified();
      } else {
        showToast('Profile updated', 'success');
        router.back();
      }
    } catch (e) {
      setFormError(getErrorMessage(e, 'Couldn’t save your profile. Please try again.'));
      setBusy(false);
    }
  };

  if (existing.loading) {
    return (
      <View style={styles.center}>
        <ThemedText themeColor="textSecondary">{existing.slow ? 'Waking things up…' : 'Loading your profile…'}</ThemedText>
      </View>
    );
  }
  if (existing.error && !existing.data) {
    return (
      <View style={styles.center}>
        <ThemedText themeColor="danger" style={{ textAlign: 'center' }}>
          {existing.error}
        </ThemedText>
        <Button title="Try again" variant="secondary" icon="refresh" onPress={existing.reload} />
      </View>
    );
  }

  const coverUri = cover?.uri ?? mediaUrl(profile?.cover_photo);
  const avatarUri = avatar?.uri ?? profile?.profile_picture;
  const readonlyEmail = !!(profile?.email ?? profile?.user?.email);

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={mode === 'edit' ? offset : 0} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: mode === 'create' ? insets.top + Spacing.three : Spacing.three, paddingBottom: insets.bottom + Spacing.five }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        {mode === 'create' ? (
          <View style={{ gap: Spacing.one }}>
            <ThemedText type="eyebrow" style={{ color: theme.link }}>
              One last step
            </ThemedText>
            <ThemedText type="headline">Set up your profile</ThemedText>
            <ThemedText themeColor="textSecondary">Neighbours trust people they can see. Add a photo and a few details.</ThemedText>
          </View>
        ) : null}

        <View>
          <PressableScale onPress={() => choose('cover')} accessibilityRole="button" accessibilityLabel="Change cover photo" style={[styles.cover, { backgroundColor: theme.forest, borderColor: errors.cover ? theme.danger : 'transparent' }]}>
            {coverUri ? <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
            <View style={styles.coverLabel}>
              <Icon name="camera" size={16} tint="#F4F8EE" />
              <ThemedText type="label" style={{ color: '#F4F8EE' }}>
                {coverUri ? 'Change cover' : 'Add cover photo'}
              </ThemedText>
            </View>
          </PressableScale>
          <View style={styles.avatarWrap}>
            <PressableScale onPress={() => choose('avatar')} accessibilityRole="button" accessibilityLabel="Change profile photo">
              <Avatar uri={avatarUri} name={`${v.first_name} ${v.last_name}`} size={88} ring />
              <View style={[styles.camera, { backgroundColor: theme.primary, borderColor: theme.background }]}>
                <Icon name="camera" size={14} color="onPrimary" />
              </View>
            </PressableScale>
          </View>
          {errors.avatar || errors.cover ? (
            <ThemedText type="caption" themeColor="danger" style={{ marginTop: Spacing.two }}>
              {errors.avatar ?? errors.cover}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.pair}>
          <View style={{ flex: 1 }}>
            <TextField label="First name" value={v.first_name} onChangeText={set('first_name')} error={errors.first_name} returnKeyType="next" onSubmitEditing={next('last')} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Last name" inputRef={reg('last')} value={v.last_name} onChangeText={set('last_name')} error={errors.last_name} returnKeyType="next" onSubmitEditing={next('email')} />
          </View>
        </View>
        <TextField label="Username" icon="at" value={v.username} editable={false} />
        <TextField label="Email" icon="mail" inputRef={reg('email')} value={v.email} onChangeText={set('email')} error={errors.email} editable={!readonlyEmail} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" onSubmitEditing={next('bio')} />
        <TextField label="About you" inputRef={reg('bio')} value={v.bio} onChangeText={set('bio')} error={errors.bio} multiline maxLength={300} placeholder="A line or two for your neighbours" hint={`${v.bio.length}/300`} />
        <TextField label="What do you do?" icon="briefcase" inputRef={reg('profession')} value={v.profession} onChangeText={set('profession')} error={errors.profession} returnKeyType="next" onSubmitEditing={next('phone')} />
        <TextField label="Phone" icon="phone" inputRef={reg('phone')} value={v.phone_number} onChangeText={set('phone_number')} error={errors.phone_number} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={next('website')} />
        <TextField label="Website (optional)" icon="link" inputRef={reg('website')} value={v.bio_url} onChangeText={set('bio_url')} autoCapitalize="none" keyboardType="url" returnKeyType="next" onSubmitEditing={next('address')} />

        <View style={{ gap: Spacing.two }}>
          <TextField label="Gender" inputRef={reg('gender')} value={v.gender} onChangeText={set('gender')} error={errors.gender} returnKeyType="next" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }} keyboardShouldPersistTaps="handled">
            {GENDERS.map((g) => (
              <Chip key={g} label={g} selected={v.gender === g} onPress={() => setV((cur) => ({ ...cur, gender: g }))} />
            ))}
          </ScrollView>
        </View>

        <TextField label="Address" icon="house" inputRef={reg('address')} value={v.address} onChangeText={set('address')} error={errors.address} returnKeyType="next" />
        <View style={styles.pair}>
          <View style={{ flex: 1 }}>
            <TextField label="Town or city" value={v.location} onChangeText={set('location')} error={errors.location} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Postcode" value={v.postal_code} onChangeText={set('postal_code')} error={errors.postal_code} autoCapitalize="characters" />
          </View>
        </View>

        {formError ? (
          <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
            {formError}
          </ThemedText>
        ) : null}
        <Button title={mode === 'create' ? 'Finish and join' : 'Save changes'} size="lg" fullWidth loading={busy} onPress={submit} />
        {mode === 'create' ? <Button title="Log out" variant="ghost" fullWidth onPress={() => void signOut()} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, padding: Spacing.four },
  content: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  pair: { flexDirection: 'row', gap: Spacing.three },
  cover: { height: 130, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  coverLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(8,24,17,0.55)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill },
  avatarWrap: { marginTop: -44, marginLeft: Spacing.three },
  camera: { position: 'absolute', right: 0, bottom: 2, width: 30, height: 30, borderRadius: 15, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
});
