'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

/** True after zustand `persist` has rehydrated from localStorage (avoids false logged-out state on first paint). */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    if (useAuthStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);
  return hydrated;
}

/** Admin API calls should wait for auth rehydration and a confirmed admin session. */
export function useAdminApiEnabled() {
  const hydrated = useAuthHydrated();
  const { isAuthenticated, user } = useAuthStore();
  return hydrated && isAuthenticated && user?.role === 'admin';
}
