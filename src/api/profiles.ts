import { api } from './client';
import type { LocalFile, Profile, ProfilePreview, ProfileResponse } from './types';

export async function getMyProfile(): Promise<ProfileResponse> {
  const res = await api.get<ProfileResponse>('auth/profile/');
  return res.data;
}

export async function getProfileByRef(ref: string): Promise<ProfileResponse> {
  const res = await api.get<ProfileResponse>(`auth/profile/ref/${encodeURIComponent(ref)}/`);
  return res.data;
}

export async function getProfilePreviews(): Promise<ProfilePreview[]> {
  const res = await api.get<ProfilePreview[]>('auth/allprofilespreview/');
  return Array.isArray(res.data) ? res.data : [];
}

export type ProfileInput = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio: string;
  profession: string;
  phone_number: string;
  bio_url: string;
  address: string;
  location: string;
  postal_code: string;
  gender: string;
  profile_picture?: LocalFile | null;
  cover_photo?: LocalFile | null;
};

export async function saveProfile(input: ProfileInput): Promise<{ message?: string; profile?: Profile }> {
  const form = new FormData();
  const { profile_picture, cover_photo, ...fields } = input;
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  form.append('is_verified', 'true');
  if (profile_picture) form.append('profile_picture', profile_picture as unknown as Blob);
  if (cover_photo) form.append('cover_photo', cover_photo as unknown as Blob);
  const res = await api.post<{ message?: string; profile?: Profile }>('auth/profile/edit/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  });
  return res.data;
}
