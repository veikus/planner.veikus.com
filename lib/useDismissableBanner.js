'use client';

import { useCallback, useSyncExternalStore } from 'react';

let listeners = [];

const subscribe = (listener) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};

// Server-rendered HTML has no access to localStorage, so banners are
// hidden during SSR and appear on the client after hydration.
const getServerSnapshot = () => false;

// Visibility for dismiss-once banners: visible until a value is stored
// under `storageKey`, hidden forever after dismiss().
export function useDismissableBanner(storageKey) {
  const getSnapshot = useCallback(() => localStorage.getItem(storageKey) === null, [storageKey]);
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey, 'true');
    listeners.forEach((listener) => listener());
  }, [storageKey]);

  return { visible, dismiss };
}
