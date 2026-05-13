'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { getErrorMessage, cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const PERKS = [
  'Funds locked until work approved',
  'JazzCash & EasyPaisa support',
  'Dispute resolution by expert admins',
  'Complete audit trail on every deal',
];

function GridPattern({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {[0,40,80,120,160,200,240,280,320].map(x => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="320" stroke="currentColor" strokeWidth="0.6" />
      ))}
      {[0,40,80,120,160,200,240,280,320].map(y => (
        <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} stroke="currentColor" strokeWidth="0.6" />
      ))}
      <rect x="100" y="60" width="120" height="120" transform="rotate(45 160 120)" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <rect x="115" y="75" width="90" height="90" transform="rotate(45 160 120)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <rect x="130" y="90" width="60" height="60" transform="rotate(45 160 120)" stroke="currentColor" strokeWidth="0.4" fill="none" />
    </svg>
  );
}

const inputBase =
  'box-border h-[46px] w-full appearance-none rounded-lg border border-ink/[0.14] bg-white pl-3.5 pr-10 font-sans text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink/35 focus:border-upwork-green focus:shadow-[0_0_0_3px_rgba(6,78,59,0.1)]';

export default function LoginPage() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="relative z-20 flex h-14 items-center justify-between bg-upwork-green px-6 md:hidden">
        <Link href="/" className="font-display text-[1.1rem] font-extrabold tracking-tight text-white no-underline">
          Escrow<span className="text-saffron">PK</span>
        </Link>
        <div className="flex gap-4">
          <button type="button" aria-label="Menu" className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-white/70">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button type="button" aria-label="Account" className="flex cursor-pointer items-center border-0 bg-transparent p-1 text-white/70">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="grid min-h-screen grid-cols-1 font-sans md:grid-cols-2">

        <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-upwork-green py-9 px-7 pb-8 md:px-11 md:py-8 md:pb-9">
          <GridPattern className="pointer-events-none absolute -right-10 -top-10 h-[360px] w-[360px] text-emerald2-200/[0.12]" />
          <GridPattern className="pointer-events-none absolute -bottom-[60px] -left-[60px] h-[280px] w-[280px] text-emerald2-200/[0.08]" />

          <Link href="/" className="relative z-10 hidden font-display text-xl font-extrabold tracking-tight text-white no-underline md:block">
            Escrow<span className="text-saffron">PK</span>
          </Link>

          <div className="relative z-10">
            <h1 className="mb-4 font-display text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold leading-tight tracking-tightest text-white">
              Pakistan&apos;s most trusted escrow platform
            </h1>
            <p className="mb-8 max-w-[340px] text-[14.5px] leading-relaxed text-white/60">
              Secure payments for freelancers, buyers, and sellers.
              Your money is protected until both parties are satisfied.
            </p>
            <div>
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5 py-1.5 text-[13.5px] font-medium text-white/[0.82]">
                  <CheckCircle2 className="h-[17px] w-[17px] shrink-0 text-emerald2-400" />
                  {perk}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 hidden text-[11.5px] text-white/30 md:block">© 2024 EscrowPK. All rights reserved.</p>
        </div>

        <div className="relative flex items-center justify-center overflow-hidden bg-ivory py-9 px-6 md:px-8 md:py-12">
          <GridPattern className="pointer-events-none absolute -right-[30px] -top-[30px] h-[300px] w-[300px] text-saffron/10" />
          <GridPattern className="pointer-events-none absolute -bottom-[50px] -left-[50px] h-[260px] w-[260px] text-upwork-green/[0.05]" />

          <div className="relative z-10 w-full max-w-[380px] md:max-w-[380px]">
            <h1 className="mb-1 font-display text-[1.75rem] font-extrabold tracking-tightest text-ink">Welcome back</h1>
            <p className="mb-8 text-[13.5px] text-brand-light">Sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <div className="mb-[1.1rem]">
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Email address</label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className={cn(
                      inputBase,
                      errors.email && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="Email address"
                  />
                  <span className="pointer-events-none absolute right-[13px] top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-ink/30" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </span>
                </div>
                {errors.email && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.email.message as string}</p>
                )}
              </div>

              <div className="mb-[1.1rem]">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-ink">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-saffron hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={cn(
                      inputBase,
                      errors.password && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute right-[13px] top-1/2 flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-ink/30"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.password.message as string}</p>
                )}
              </div>

              <button
                type="submit"
                className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-upwork-green font-display text-[14.5px] font-bold tracking-wide text-white transition-[background,transform] hover:bg-upwork-green-d active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-[0.65]"
                disabled={loading}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>

            </form>

            <p className="mt-5 text-center text-[13px] text-brand-light">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-saffron no-underline hover:underline">
                Create one free
              </Link>
            </p>

            <div className="mt-7 flex items-center justify-center gap-1.5 text-[11.5px] text-ink/40">
              <Lock className="h-3 w-3 text-upwork-green" />
              SSL encrypted · Your data is safe
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
