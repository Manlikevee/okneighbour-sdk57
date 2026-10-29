import { ProfileForm } from '@/components/profile/profile-form';

/** Shown to signed-in accounts that haven't finished their profile yet. */
export default function CompleteProfileScreen() {
  return <ProfileForm mode="create" />;
}
