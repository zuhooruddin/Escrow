'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';

/** Sends logged-in visitors away from the marketing home page to their app area. */
export default function RedirectHomeIfAuthed() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    router.replace(user?.role === 'admin' ? '/admin' : '/dashboard');
  }, [hydrated, isAuthenticated, user?.role, router]);

  return null;
}
