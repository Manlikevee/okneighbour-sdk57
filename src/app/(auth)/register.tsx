import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { register } from '@/api/auth';
import { getErrorMessage } from '@/api/client';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { showToast } from '@/lib/toast';
import { useLocation } from '@/providers/location-provider';

type Fields = { first: string; last: string; username: string; email: string; password: string; location: string; address: string; postal: string };
const EMPTY: Fields = { first: '', last: '', username: '', email: '', password: '', location: '', address: '', postal: '' };

export default function RegisterScreen() {
  const { place, locateDevice } = useLocation();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [show, setShow] = useState(false);
  const refs = useRef<Record<string, TextInput | null>>({});

  const set = (k: keyof Fields) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const next = (k: string) => () => refs.current[k]?.focus();

  const fillFromPlace = (p: NonNullable<typeof place>) =>
    setF((cur) => ({ ...cur, location: cur.location || p.city, address: cur.address || p.displayName, postal: cur.postal || (p.postCode ?? '') }));

  const locate = async () => {
    setLocating(true);
    const ok = await locateDevice();
    setLocating(false);
    if (ok) showToast('Location added', 'success');
  };

  // Prefill once a place is known (from this screen or a previous visit).
  const [prefilled, setPrefilled] = useState(false);
  if (place && !prefilled) {
    setPrefilled(true);
    fillFromPlace(place);
  }

  const validate = () => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!f.first.trim()) e.first = 'Required';
    if (!f.last.trim()) e.last = 'Required';
    if (!f.username.trim()) e.username = 'Choose a username';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
    if (f.password.length < 8) e.password = 'Use at least 8 characters';
    if (!f.location.trim()) e.location = 'Where do you live?';
    if (!f.address.trim()) e.address = 'Required';
    if (!f.postal.trim()) e.postal = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (busy || !validate()) return;
    setBusy(true);
    setFormError(null);
    try {
      await register({
        username: f.username.trim(),
        email: f.email.trim(),
        first_name: f.first.trim(),
        last_name: f.last.trim(),
        postal_code: f.postal.trim(),
        location: f.location.trim(),
        address: f.address.trim(),
        password: f.password,
      });
      showToast('Account created. Log in to continue.', 'success');
      router.replace('/login');
    } catch (e) {
      setFormError(getErrorMessage(e, 'We couldn’t create your account. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Join your neighbourhood" subtitle="Create your account in a minute.">
      <View style={{ flexDirection: 'row', gap: Spacing.three }}>
        <View style={{ flex: 1 }}>
          <TextField label="First name" value={f.first} onChangeText={set('first')} error={errors.first} autoComplete="given-name" textContentType="givenName" returnKeyType="next" onSubmitEditing={next('last')} />
        </View>
        <View style={{ flex: 1 }}>
          <TextField label="Last name" inputRef={(r) => { refs.current.last = r; }} value={f.last} onChangeText={set('last')} error={errors.last} autoComplete="family-name" textContentType="familyName" returnKeyType="next" onSubmitEditing={next('username')} />
        </View>
      </View>
      <TextField label="Username" icon="at" inputRef={(r) => { refs.current.username = r; }} value={f.username} onChangeText={set('username')} error={errors.username} autoCapitalize="none" autoCorrect={false} autoComplete="username-new" returnKeyType="next" onSubmitEditing={next('email')} />
      <TextField label="Email" icon="mail" inputRef={(r) => { refs.current.email = r; }} value={f.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next" onSubmitEditing={next('password')} />
      <TextField
        label="Password"
        icon="lock"
        inputRef={(r) => { refs.current.password = r; }}
        value={f.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        hint="At least 8 characters"
        right={
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={20} color="textTertiary" />
          </Pressable>
        }
      />

      <ThemedText type="heading" style={{ marginTop: Spacing.two }}>
        Where you live
      </ThemedText>
      <Button title={locating ? 'Locating…' : 'Fill from my current location'} icon="locationArrow" variant="secondary" loading={locating} onPress={locate} />
      <TextField label="Town or city" icon="location" value={f.location} onChangeText={set('location')} error={errors.location} placeholder="e.g. Luton" returnKeyType="next" />
      <TextField label="Address" icon="house" value={f.address} onChangeText={set('address')} error={errors.address} autoComplete="street-address" returnKeyType="next" />
      <TextField label="Postcode" value={f.postal} onChangeText={set('postal')} error={errors.postal} autoCapitalize="characters" autoComplete="postal-code" returnKeyType="go" onSubmitEditing={submit} />

      {formError ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {formError}
        </ThemedText>
      ) : null}
      <Button title="Create account" size="lg" fullWidth loading={busy} onPress={submit} style={{ marginTop: Spacing.two }} />
      <Button title="Already a neighbour? Log in" variant="ghost" fullWidth onPress={() => router.replace('/login')} />
    </AuthShell>
  );
}
