'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    api.get(`/auth/verify-email/${token}`)
      .then(() => {
        setState('success');
        setTimeout(() => router.push('/auth/login'), 3500);
      })
      .catch(err => {
        setState('error');
        setMessage(err?.response?.data?.message || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e0ddd4] shadow-sm p-10 text-center">

        {state === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#f0f9f4] flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-[#0d2a1f] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#0d2a1f] mb-2">Verifying your email…</h1>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#f0f9f4] flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-[#0d2a1f] mb-2">Email verified!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your account is now active. Redirecting you to login…
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#0d2a1f] text-white text-sm font-semibold hover:bg-[#153d30] transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-[#0d2a1f] mb-2">Verification failed</h1>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-[#0d2a1f] text-white text-sm font-semibold hover:bg-[#153d30] transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-xs text-gray-400">
                Need a new link?{' '}
                <Link href="/auth/login" className="text-[#0d2a1f] underline">
                  Log in and we'll resend it
                </Link>
              </p>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center">
          <img src="/logo.webp" alt="Rakhwali PK" className="h-7 w-auto object-contain opacity-60" />
        </div>
      </div>
    </div>
  );
}
