import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';

import { getErrorMessage } from '@/api/client';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextField } from '@/components/ui/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/providers/session-provider';

export default function LoginScreen() {
  const { signIn } = useSession();
  const passwordRef = useRef<TextInput>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    if (!username.trim() || !password) {
      setError('Enter your username and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(username, password);
      // The root layout swaps to the signed-in stack automatically.
    } catch (e) {
      setError(getErrorMessage(e, 'We couldn’t log you in. Check your details and try again.'));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see what’s happening around you.">
      <TextField
        label="Username"
        icon="person"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="Your username"
      />
      <TextField
        label="Password"
        icon="lock"
        inputRef={passwordRef}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        placeholder="Your password"
        right={
          <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={20} color="textTertiary" />
          </Pressable>
        }
      />
      {error ? (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {error}
        </ThemedText>
      ) : null}
      <Button title="Log in" size="lg" fullWidth loading={busy} onPress={submit} style={{ marginTop: Spacing.two }} />
      <Button title="New here? Create an account" variant="ghost" fullWidth onPress={() => router.replace('/register')} />
    </AuthShell>
  );
}
