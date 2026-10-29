import { useLocalSearchParams } from 'expo-router';

import { ProfileView } from '@/components/profile/profile-view';

export default function UserProfileScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  return <ProfileView profileRef={String(ref)} />;
}
