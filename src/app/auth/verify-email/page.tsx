'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function VerifyEmailRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token') || searchParams.get('Token');
    if (token) {
      router.replace(`/auth/verify-email/${token}`);
    } else {
      router.replace('/auth/login');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3ee]">
      <Loader2 size={28} className="text-[#0d2a1f] animate-spin" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailRedirect />
    </Suspense>
  );
}
