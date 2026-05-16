'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Lock, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, cn } from '@/lib/utils';
import api from '@/lib/api';

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const REQUIREMENTS = [
  { label: 'At least 8 characters',      test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter (A–Z)',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number (0–9)',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character',       test: (p: string) => /[^A-Za-z0-9]/.test(p) },
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
      <rect x="115" y="75" width="90"  height="90"  transform="rotate(45 160 120)" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <rect x="130" y="90" width="60"  height="60"  transform="rotate(45 160 120)" stroke="currentColor" strokeWidth="0.4" fill="none" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [done,        setDone]        = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');

  const strength = REQUIREMENTS.filter(r => r.test(password)).length;
  const strengthColor =
    strength < 2 ? '#ef4444' : strength < 3 ? '#f59e0b' : '#064e3b';
  const strengthLabel =
    strength < 2 ? 'Weak' : strength < 3 ? 'Fair' : strength < 4 ? 'Good' : 'Strong';

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new link.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .epk-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Figtree', system-ui, sans-serif;
        }
        @media (max-width: 768px) {
          .epk-page { grid-template-columns: 1fr; }
        }

        /* ── Left panel ── */
        .epk-left {
          background: #064e3b;
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 2rem 2.75rem 2.25rem;
          min-height: 420px;
        }
        .epk-left-pattern {
          position: absolute; right: -40px; top: -40px;
          width: 360px; height: 360px;
          color: rgba(184,212,198,0.12); pointer-events: none;
        }
        .epk-left-pattern-b {
          position: absolute; left: -60px; bottom: -60px;
          width: 280px; height: 280px;
          color: rgba(184,212,198,0.08); pointer-events: none;
        }
        .epk-left-logo {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800; font-size: 1.25rem;
          color: white; text-decoration: none;
          position: relative; z-index: 1; letter-spacing: -0.02em;
        }
        .epk-left-logo em { font-style: normal; color: #b8954a; }
        .epk-left-body { position: relative; z-index: 1; }
        .epk-left-body h1 {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.4rem);
          font-weight: 800; color: white;
          line-height: 1.1; letter-spacing: -0.035em; margin-bottom: 1rem;
        }
        .epk-left-body p {
          font-size: 14.5px; color: rgba(255,255,255,0.6);
          line-height: 1.7; margin-bottom: 2.5rem; max-width: 340px;
        }

        /* Requirements list */
        .epk-reqs { display: flex; flex-direction: column; gap: 0; }
        .epk-req {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .epk-req:last-child { border-bottom: none; }
        .epk-req-icon {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .epk-req-icon.met  { background: rgba(92,186,148,0.2); }
        .epk-req-icon.unmet{ background: rgba(255,255,255,0.06); }
        .epk-req-icon svg  { width: 13px; height: 13px; }
        .epk-req-icon.met svg  { color: #5cba94; }
        .epk-req-icon.unmet svg{ color: rgba(255,255,255,0.3); }
        .epk-req-label {
          font-size: 13px; font-weight: 500;
          transition: color 0.2s;
        }
        .epk-req-label.met  { color: rgba(255,255,255,0.85); }
        .epk-req-label.unmet{ color: rgba(255,255,255,0.4); }

        .epk-left-foot {
          position: relative; z-index: 1;
          font-size: 11.5px; color: rgba(255,255,255,0.3);
        }

        /* ── Right panel ── */
        .epk-right {
          background: #faf6f1;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          padding: 3rem 2rem;
        }
        .epk-right-pattern {
          position: absolute; right: -30px; top: -30px;
          width: 300px; height: 300px;
          color: rgba(184,149,74,0.1); pointer-events: none;
        }
        .epk-right-pattern-b {
          position: absolute; left: -50px; bottom: -50px;
          width: 260px; height: 260px;
          color: rgba(6,78,59,0.05); pointer-events: none;
        }
        .epk-form-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 380px;
        }
        .epk-form-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1.75rem; font-weight: 800;
          color: #0c1917; letter-spacing: -0.035em; margin-bottom: 4px;
        }
        .epk-form-sub { font-size: 13.5px; color: #5c6f69; margin-bottom: 2rem; }

        /* Fields */
        .epk-label {
          display: block; font-size: 13px; font-weight: 600;
          color: #0c1917; margin-bottom: 6px;
        }
        .epk-field { margin-bottom: 1.1rem; }
        .epk-input {
          width: 100%; height: 46px;
          background: white;
          border: 1px solid rgba(12,25,23,0.14);
          border-radius: 9px; padding: 0 42px 0 14px;
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 14px; color: #0c1917; outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          -webkit-appearance: none; box-sizing: border-box;
        }
        .epk-input::placeholder { color: rgba(12,25,23,0.35); }
        .epk-input:focus {
          border-color: #064e3b;
          box-shadow: 0 0 0 3px rgba(6,78,59,0.1);
        }
        .epk-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }
        .epk-input-wrap { position: relative; }
        .epk-input-icon {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          color: rgba(12,25,23,0.3); background: none; border: none; padding: 0;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          width: 16px; height: 16px;
        }
        .epk-error {
          font-size: 11.5px; color: #ef4444; margin-top: 4px; font-weight: 500;
        }

        /* Strength bar */
        .epk-strength {
          display: flex; align-items: center; gap: 6px; margin-top: 7px;
        }
        .epk-strength-bars { display: flex; gap: 4px; flex: 1; }
        .epk-strength-bar {
          height: 3px; flex: 1; border-radius: 999px;
          background: rgba(12,25,23,0.1); transition: background 0.2s;
        }
        .epk-strength-label {
          font-size: 11px; font-weight: 600; min-width: 36px; text-align: right;
        }

        /* Button */
        .epk-btn {
          width: 100%; height: 48px;
          background: #064e3b; color: white; border: none;
          border-radius: 9px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14.5px; font-weight: 700; letter-spacing: 0.01em;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; margin-top: 1.25rem;
          transition: background 0.2s, transform 0.15s;
          text-decoration: none;
        }
        .epk-btn:hover:not(:disabled) { background: #022c22; }
        .epk-btn:active:not(:disabled) { transform: scale(0.99); }
        .epk-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Back link */
        .epk-back {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; margin-top: 1.25rem;
          font-size: 13px; color: #5c6f69; text-decoration: none; font-weight: 500;
          transition: color 0.15s;
        }
        .epk-back:hover { color: #0c1917; }
        .epk-back svg { width: 14px; height: 14px; }

        /* Success */
        .epk-success-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: #ecf4f1; border: 1px solid rgba(6,78,59,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
        }
        .epk-success-icon svg { width: 26px; height: 26px; color: #064e3b; }
        .epk-success-note {
          font-size: 13.5px; color: #5c6f69; line-height: 1.7; margin-bottom: 1.75rem;
        }

        /* SSL */
        .epk-secure {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 11.5px; color: rgba(12,25,23,0.4); margin-top: 1.75rem;
        }
        .epk-secure svg { width: 12px; height: 12px; color: #064e3b; }
        .epk-footer-note {
          text-align: center; font-size: 11.5px;
          color: rgba(12,25,23,0.3); margin-top: 6px;
        }

        /* Mobile nav */
        .epk-mobile-nav {
          display: none; align-items: center; justify-content: space-between;
          padding: 0 1.5rem; height: 56px;
          background: #064e3b; position: relative; z-index: 2;
        }
        .epk-mobile-nav-logo {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800; font-size: 1.1rem;
          color: white; text-decoration: none; letter-spacing: -0.02em;
        }
        .epk-mobile-nav-logo em { font-style: normal; color: #b8954a; }
        .epk-mobile-nav-icons { display: flex; gap: 1rem; }
        .epk-mobile-nav-icons button {
          background: none; border: none; color: rgba(255,255,255,0.7);
          cursor: pointer; padding: 4px; display: flex; align-items: center;
        }

        @media (max-width: 768px) {
          .epk-mobile-nav { display: flex; }
          .epk-left       { padding: 2.25rem 1.75rem 2rem; }
          .epk-left-logo  { display: none; }
          .epk-left-foot  { display: none; }
          .epk-right      { padding: 2.25rem 1.5rem; align-items: flex-start; }
          .epk-form-card  { max-width: 100%; }
        }
      `}</style>

      {/* Mobile nav */}
      <nav className="epk-mobile-nav">
        <Link href="/" className="epk-mobile-nav-logo"><img src="/logo.webp" alt="Rakhwali PK" className="h-10 w-auto object-contain rounded-xl bg-white/90 p-1.5" /></Link>
        <div className="epk-mobile-nav-icons">
          <button aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button aria-label="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>
      </nav>

      <div className="epk-page">

        {/* ── Left panel ── */}
        <div className="epk-left">
          <GridPattern className="epk-left-pattern" />
          <GridPattern className="epk-left-pattern-b" />

   <Link href="/" className="relative z-10 hidden md:block">
          <img src="/logo.png" alt="Rakhwali PK" className="h-32 w-auto object-contain " />
          </Link>
          <div className="epk-left-body">
            <h1>Create a strong new password</h1>
            <p>
              Your new password must meet all requirements below.
              Choose something you haven't used before.
            </p>

            {/* Live requirements list */}
            <div className="epk-reqs">
              {REQUIREMENTS.map(({ label, test }) => {
                const met = password ? test(password) : false;
                return (
                  <div key={label} className="epk-req">
                    <div className={`epk-req-icon ${met ? 'met' : 'unmet'}`}>
                      <CheckCircle2 />
                    </div>
                    <span className={`epk-req-label ${met ? 'met' : 'unmet'}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="epk-left-foot">© 2024 Rakhwali PK. All rights reserved.</p>
        </div>

        {/* ── Right panel ── */}
        <div className="epk-right">
          <GridPattern className="epk-right-pattern" />
          <GridPattern className="epk-right-pattern-b" />

          <div className="epk-form-card">

            {done ? (
              /* ── Success state ── */
              <>
                <div className="epk-success-icon">
                  <ShieldCheck />
                </div>
                <h1 className="epk-form-title">Password updated!</h1>
                <p className="epk-form-sub">Your account is now secured.</p>
                <p className="epk-success-note">
                  Your password has been changed successfully. All other sessions have been signed out for your security.
                </p>
                <Link href="/auth/login" className="epk-btn">
                  Sign in with new password
                </Link>
              </>
            ) : (
              /* ── Form state ── */
              <>
                <h1 className="epk-form-title">Reset your password</h1>
                <p className="epk-form-sub">Enter and confirm your new password below</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>

                  {/* New password */}
                  <div className="epk-field">
                    <label className="epk-label">New password</label>
                    <div className="epk-input-wrap">
                      <input
                        {...register('password')}
                        type={showPass ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn('epk-input', errors.password && 'error')}
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                      />
                      <button
                        type="button"
                        className="epk-input-icon"
                        onClick={() => setShowPass(!showPass)}
                        aria-label={showPass ? 'Hide password' : 'Show password'}
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password && (
                      <div className="epk-strength">
                        <div className="epk-strength-bars">
                          {[1,2,3,4].map(i => (
                            <div
                              key={i}
                              className="epk-strength-bar"
                              style={{ background: i <= strength ? strengthColor : undefined }}
                            />
                          ))}
                        </div>
                        <span className="epk-strength-label" style={{ color: strengthColor }}>
                          {strengthLabel}
                        </span>
                      </div>
                    )}
                    {errors.password && (
                      <p className="epk-error">{errors.password.message as string}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="epk-field">
                    <label className="epk-label">Confirm new password</label>
                    <div className="epk-input-wrap">
                      <input
                        {...register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        className={cn('epk-input', errors.confirmPassword && 'error')}
                        placeholder="Repeat your new password"
                      />
                      <button
                        type="button"
                        className="epk-input-icon"
                        onClick={() => setShowConfirm(!showConfirm)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="epk-error">{errors.confirmPassword.message as string}</p>
                    )}
                  </div>

                  <button type="submit" className="epk-btn" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Updating password…' : 'Set new password'}
                  </button>
                </form>

                <Link href="/auth/login" className="epk-back">
                  <ArrowLeft /> Back to sign in
                </Link>
              </>
            )}

            <div className="epk-secure">
              <Lock /> SSL encrypted · Your data is safe
            </div>
            <p className="epk-footer-note">© 2024 Rakhwali PK. All rights reserved.</p>
          </div>
        </div>

      </div>
    </>
  );
}