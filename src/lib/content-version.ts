import { useSyncExternalStore } from 'react';

let version = 0;
const listeners = new Set<() => void>();

/** Call after creating/editing content so feeds and profiles refetch. */
export function bumpContentVersion() {
  version += 1;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useContentVersion(): number {
  return useSyncExternalStore(subscribe, () => version, () => version);
}
