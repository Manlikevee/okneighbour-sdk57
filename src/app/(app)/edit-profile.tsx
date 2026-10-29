import { router, Stack } from 'expo-router';

import { ProfileForm } from '@/components/profile/profile-form';
import { HeaderButton } from '@/components/ui/header-button';

export default function EditProfileScreen() {
  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} /> }} />
      <ProfileForm mode="edit" />
    </>
  );
}
