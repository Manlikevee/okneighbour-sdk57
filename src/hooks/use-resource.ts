import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '@/api/client';
import { useContentVersion } from '@/lib/content-version';

export type Resource<T> = {
  data: T | null;
  /** Error message; may coexist with stale `data` when a refresh fails. */
  error: string | null;
  /** True until the first result (or error) arrives for the current key. */
  loading: boolean;
  /** True during pull-to-refresh / manual reload. */
  refreshing: boolean;
  /** True when the first load is taking long (the free-tier server may be waking up). */
  slow: boolean;
  reload: () => void;
};

type Entry<T> = { key: string; value?: T; error?: string };

/**
 * Small data-fetching hook. `key === null` disables fetching. A new key discards old data so
 * results from a different scope are never shown. Set `watchContent` to refetch when content
 * is created or edited elsewhere in the app.
 */
export function useResource<T>(key: string | null, fetcher: () => Promise<T>, options?: { watchContent?: boolean }): Resource<T> {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const contentVersion = useContentVersion();
  const version = options?.watchContent ? contentVersion : 0;

  const [entry, setEntry] = useState<Entry<T> | null>(null);
  const [nonce, setNonce] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [slow, setSlow] = useState(false);

  const current = entry && entry.key === key ? entry : null;

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    const slowTimer = setTimeout(() => setSlow(true), 6000);
    fetcherRef
      .current()
      .then((value) => {
        if (!cancelled) setEntry({ key, value });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = getErrorMessage(e);
        setEntry((prev) => (prev && prev.key === key ? { ...prev, error: message } : { key, error: message }));
      })
      .finally(() => {
        clearTimeout(slowTimer);
        if (!cancelled) {
          setSlow(false);
          setRefreshing(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [key, nonce, version]);

  const reload = useCallback(() => {
    setRefreshing(true);
    setNonce((n) => n + 1);
  }, []);

  const data = current?.value ?? null;
  const error = current?.error ?? null;
  return {
    data,
    error,
    loading: key !== null && data === null && error === null,
    refreshing,
    slow,
    reload,
  };
}
