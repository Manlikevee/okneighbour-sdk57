import * as ImagePicker from 'expo-image-picker';

import type { LocalFile } from '@/api/types';
import { showToast } from '@/lib/toast';

function guessMime(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  // "image/jpg" (what the previous app sent) is not a valid MIME type.
  return 'image/jpeg';
}

type Options = { limit?: number; aspect?: [number, number] };

/** Opens the photo library. Returns [] when cancelled or on failure. */
export async function pickImages({ limit = 1, aspect }: Options = {}): Promise<LocalFile[]> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      allowsEditing: limit === 1 && !!aspect,
      aspect,
      quality: 0.8,
    });
    if (result.canceled) return [];
    return result.assets.slice(0, limit).map((a, i) => {
      const name = a.fileName ?? `upload-${Date.now()}-${i}.jpg`;
      return { uri: a.uri, name, type: a.mimeType ?? guessMime(name) };
    });
  } catch {
    showToast('Couldn’t open your photos. Check OkNeighbour has access in Settings.', 'error');
    return [];
  }
}
