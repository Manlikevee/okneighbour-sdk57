import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Linking } from 'react-native';

import { showToast } from '@/lib/toast';

/** Opens http(s) links in the in-app browser and mailto:/tel: links with the system handler. */
export async function openLink(url: string) {
  try {
    if (/^https?:\/\//i.test(url)) {
      await openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
    } else {
      await Linking.openURL(url);
    }
  } catch {
    showToast('Couldn’t open that link.', 'error');
  }
}

export function normalizeUrl(url: string): string {
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
