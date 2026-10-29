import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Linking } from 'react-native';

import { reverseGeocode } from '@/api/geocode';
import { getErrorMessage } from '@/api/client';
import { LOCATION_CACHE_MS, StorageKeys } from '@/constants/config';
import type { Place } from '@/lib/place';
import { getJSON, setJSON } from '@/lib/storage';
import { showToast } from '@/lib/toast';
import { useSession } from '@/providers/session-provider';

type Permission = 'unknown' | 'granted' | 'denied' | 'blocked';

type LocationState = {
  /** The place the whole app is scoped to (device location or one the person chose). */
  place: Place | null;
  recents: Place[];
  permission: Permission;
  /** True while the first place is being resolved. */
  resolving: boolean;
  locateDevice: () => Promise<boolean>;
  choosePlace: (place: Place) => void;
  openSettings: () => void;
};

const LocationContext = createContext<LocationState | null>(null);

export function useLocation(): LocationState {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used inside <LocationProvider>');
  return ctx;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [place, setPlace] = useState<Place | null>(null);
  const [recents, setRecents] = useState<Place[]>([]);
  const [permission, setPermission] = useState<Permission>('unknown');
  const [resolving, setResolving] = useState(true);
  const placeRef = useRef<Place | null>(null);

  useEffect(() => {
    placeRef.current = place;
  }, [place]);

  const remember = useCallback((p: Place) => {
    setPlace(p);
    void setJSON(StorageKeys.place, p);
    setRecents((prev) => {
      const next = [p, ...prev.filter((x) => x.city.toLowerCase() !== p.city.toLowerCase())].slice(0, 5);
      void setJSON(StorageKeys.recentPlaces, next);
      return next;
    });
  }, []);

  const resolveDevice = useCallback(async (): Promise<Place | null> => {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
  }, []);

  // Restore the saved place immediately, then (once signed in) refresh a device-derived one.
  useEffect(() => {
    if (status !== 'signedIn') return;
    let cancelled = false;
    (async () => {
      const [saved, savedRecents] = await Promise.all([
        getJSON<Place>(StorageKeys.place),
        getJSON<Place[]>(StorageKeys.recentPlaces),
      ]);
      if (cancelled) return;
      if (savedRecents) setRecents(savedRecents);
      if (saved) setPlace(saved);

      const perm = await Location.getForegroundPermissionsAsync();
      if (cancelled) return;
      setPermission(perm.granted ? 'granted' : perm.canAskAgain ? 'unknown' : 'blocked');

      // A place the person picked by hand is never overwritten automatically.
      const fresh = saved && Date.now() - saved.resolvedAt < LOCATION_CACHE_MS;
      if (perm.granted && (!saved || (saved.source === 'device' && !fresh))) {
        try {
          const p = await resolveDevice();
          if (!cancelled && p) remember(p);
        } catch {
          // Keep whatever place we already have.
        }
      }
      if (!cancelled) setResolving(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [status, resolveDevice, remember]);

  const locateDevice = useCallback(async () => {
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        setPermission(perm.canAskAgain ? 'denied' : 'blocked');
        return false;
      }
      setPermission('granted');
      const p = await resolveDevice();
      if (!p) {
        showToast('We couldn’t work out your town. Try searching for it instead.', 'error');
        return false;
      }
      remember(p);
      return true;
    } catch (e) {
      showToast(getErrorMessage(e, 'Couldn’t get your location. Try searching for it instead.'), 'error');
      return false;
    }
  }, [resolveDevice, remember]);

  const choosePlace = useCallback((p: Place) => remember({ ...p, source: 'manual', resolvedAt: Date.now() }), [remember]);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const value = useMemo<LocationState>(
    () => ({ place, recents, permission, resolving, locateDevice, choosePlace, openSettings }),
    [place, recents, permission, resolving, locateDevice, choosePlace, openSettings],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
