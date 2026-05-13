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
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^(\+92|92|0)?3[0-9]{9}$/, 'Enter a valid Pakistani mobile number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const PERKS = [
  'Funds locked until work is approved',
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

function strengthBarClass(i: number, strength: number) {
  if (i > strength) return 'bg-ink/10';
  if (strength < 2) return 'bg-red-500';
  if (strength < 3) return 'bg-amber-500';
  return 'bg-upwork-green';
}

function strengthLabelClass(strength: number) {
  if (strength < 2) return 'text-red-500';
  if (strength < 3) return 'text-amber-500';
  return 'text-upwork-green';
}

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const strengthLabel =
    strength < 2 ? 'Weak' : strength < 3 ? 'Fair' : strength < 4 ? 'Good' : 'Strong';

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast.success('Account created! Welcome to EscrowPK.');
      router.push('/dashboard');
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

          <div className="relative z-10 w-full max-w-[400px]">
            <h1 className="mb-1 font-display text-[1.75rem] font-extrabold tracking-tightest text-ink">Create your account</h1>
            <p className="mb-8 text-[13.5px] text-brand-light">Free to join · No hidden fees</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <div className="mb-[1.1rem]">
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Full Name</label>
                <div className="relative">
                  <input
                    {...register('fullName')}
                    className={cn(
                      inputBase,
                      'pr-3.5',
                      errors.fullName && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="Muhammad Ali"
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.fullName.message as string}</p>
                )}
              </div>

              <div className="mb-[1.1rem]">
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Email Address</label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={cn(
                      inputBase,
                      errors.email && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="ali@example.com"
                    autoComplete="email"
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
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Pakistani Mobile Number</label>
                <div className="relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    className={cn(
                      inputBase,
                      'pr-3.5',
                      errors.phone && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="03XXXXXXXXX"
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.phone.message as string}</p>
                )}
              </div>

              <div className="mb-[1.1rem]">
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    className={cn(
                      inputBase,
                      errors.password && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    autoComplete="new-password"
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
                {password && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={cn('h-[3px] flex-1 rounded-full transition-colors', strengthBarClass(i, strength))}
                        />
                      ))}
                    </div>
                    <span className={cn('min-w-[36px] text-right text-[11px] font-semibold', strengthLabelClass(strength))}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.password.message as string}</p>
                )}
              </div>

              <div className="mb-[1.1rem]">
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className={cn(
                      inputBase,
                      'pr-3.5',
                      errors.confirmPassword && 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)] focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
                    )}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-[11.5px] font-medium text-red-500">{errors.confirmPassword.message as string}</p>
                )}
              </div>

              <button
                type="submit"
                className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-upwork-green font-display text-[14.5px] font-bold tracking-wide text-white transition-[background,transform] hover:bg-upwork-green-d active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-[0.65]"
                disabled={loading}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating account…' : 'Create Free Account'}
              </button>
            </form>

            <p className="mt-4 text-center text-[11.5px] leading-relaxed text-ink/40">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="font-medium text-upwork-green no-underline hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="font-medium text-upwork-green no-underline hover:underline">
                Privacy Policy
              </Link>.
            </p>

            <p className="mt-5 text-center text-[13px] text-brand-light">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-saffron no-underline hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-ink/40 md:mt-7">
              <Lock className="h-3 w-3 text-upwork-green" />
              SSL encrypted · Your data is safe
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
