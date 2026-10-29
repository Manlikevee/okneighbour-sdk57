import { Appearance } from 'react-native';

import { StorageKeys } from '@/constants/config';
import { getItem, setItem } from '@/lib/storage';

export type AppearancePref = 'system' | 'light' | 'dark';

export async function loadAppearance(): Promise<AppearancePref> {
  const v = await getItem(StorageKeys.appearance);
  return v === 'light' || v === 'dark' ? v : 'system';
}

export async function saveAppearance(pref: AppearancePref): Promise<void> {
  Appearance.setColorScheme(pref === 'system' ? null : pref);
  await setItem(StorageKeys.appearance, pref);
}

export const NEXT_APPEARANCE: Record<AppearancePref, AppearancePref> = { system: 'light', light: 'dark', dark: 'system' };
