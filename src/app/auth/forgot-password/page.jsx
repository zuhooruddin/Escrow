'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, ArrowLeft, MailCheck, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, cn } from '@/lib/utils';
import api from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const STEPS = [
  { icon: ShieldCheck, label: 'Verify your identity' },
  { icon: MailCheck,   label: 'Receive secure link' },
  { icon: KeyRound,    label: 'Reset your password' },
  { icon: RefreshCw,   label: 'Regain access' },
];

function GridPattern({ className }) {
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

export default function ForgotPasswordPage() {
  const [loading, setLoading]   = useState(false);
  const [sent,    setSent]      = useState(false);
  const [sentTo,  setSentTo]    = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentTo(data.email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
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
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2rem 2.75rem 2.25rem;
          min-height: 420px;
        }
        .epk-left-pattern {
          position: absolute;
          right: -40px; top: -40px;
          width: 360px; height: 360px;
          color: rgba(184,212,198,0.12);
          pointer-events: none;
        }
        .epk-left-pattern-b {
          position: absolute;
          left: -60px; bottom: -60px;
          width: 280px; height: 280px;
          color: rgba(184,212,198,0.08);
          pointer-events: none;
        }
        .epk-left-logo {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800; font-size: 1.25rem;
          color: white; text-decoration: none;
          position: relative; z-index: 1;
          letter-spacing: -0.02em;
        }
        .epk-left-logo em { font-style: normal; color: #b8954a; }

        .epk-left-body { position: relative; z-index: 1; }
        .epk-left-body h1 {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.4rem);
          font-weight: 800; color: white;
          line-height: 1.1; letter-spacing: -0.035em;
          margin-bottom: 1rem;
        }
        .epk-left-body p {
          font-size: 14.5px; color: rgba(255,255,255,0.6);
          line-height: 1.7; margin-bottom: 2.5rem; max-width: 340px;
        }

        /* Recovery steps */
        .epk-steps { display: flex; flex-direction: column; gap: 0; }
        .epk-step {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          position: relative;
        }
        .epk-step:last-child { border-bottom: none; }
        .epk-step-num {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .epk-step-num svg { width: 15px; height: 15px; color: #5cba94; }
        .epk-step-label {
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,0.75);
        }

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
          position: absolute;
          right: -30px; top: -30px;
          width: 300px; height: 300px;
          color: rgba(184,149,74,0.1);
          pointer-events: none;
        }
        .epk-right-pattern-b {
          position: absolute;
          left: -50px; bottom: -50px;
          width: 260px; height: 260px;
          color: rgba(6,78,59,0.05);
          pointer-events: none;
        }
        .epk-form-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 380px;
        }

        /* Success state */
        .epk-success-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: #ecf4f1;
          border: 1px solid rgba(6,78,59,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem;
        }
        .epk-success-icon svg { width: 26px; height: 26px; color: #064e3b; }
        .epk-success-email {
          display: inline-block;
          background: #ecf4f1;
          border: 1px solid rgba(6,78,59,0.12);
          border-radius: 7px;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 600;
          color: #064e3b;
          margin: 1rem 0 1.5rem;
          word-break: break-all;
        }
        .epk-success-note {
          font-size: 13px; color: #5c6f69; line-height: 1.7;
          margin-bottom: 1.75rem;
        }

        /* Form */
        .epk-form-title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1.75rem; font-weight: 800;
          color: #0c1917; letter-spacing: -0.035em;
          margin-bottom: 4px;
        }
        .epk-form-sub {
          font-size: 13.5px; color: #5c6f69; margin-bottom: 2rem;
        }
        .epk-label {
          display: block; font-size: 13px; font-weight: 600;
          color: #0c1917; margin-bottom: 6px;
        }
        .epk-field { margin-bottom: 1.1rem; }
        .epk-input {
          width: 100%; height: 46px;
          background: white;
          border: 1px solid rgba(12,25,23,0.14);
          border-radius: 9px;
          padding: 0 42px 0 14px;
          font-family: 'Figtree', system-ui, sans-serif;
          font-size: 14px; color: #0c1917;
          outline: none;
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
          color: rgba(12,25,23,0.3); width: 16px; height: 16px;
          pointer-events: none; display: flex; align-items: center;
        }
        .epk-error {
          font-size: 11.5px; color: #ef4444;
          margin-top: 4px; font-weight: 500;
        }
        .epk-btn {
          width: 100%; height: 48px;
          background: #064e3b; color: white;
          border: none; border-radius: 9px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14.5px; font-weight: 700;
          letter-spacing: 0.01em; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 1.25rem;
          transition: background 0.2s, transform 0.15s;
        }
        .epk-btn:hover:not(:disabled) { background: #022c22; }
        .epk-btn:active:not(:disabled) { transform: scale(0.99); }
        .epk-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .epk-btn-outline {
          width: 100%; height: 46px;
          background: transparent; color: #0c1917;
          border: 1px solid rgba(12,25,23,0.15); border-radius: 9px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          text-decoration: none;
          transition: background 0.2s;
          margin-top: 0.75rem;
        }
        .epk-btn-outline:hover { background: rgba(12,25,23,0.04); }
        .epk-btn-outline svg { width: 14px; height: 14px; }

        .epk-back {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; margin-top: 1.25rem;
          font-size: 13px; color: #5c6f69; text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .epk-back:hover { color: #0c1917; }
        .epk-back svg { width: 14px; height: 14px; }

        .epk-secure {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 11.5px; color: rgba(12,25,23,0.4);
          margin-top: 1.75rem;
        }
        .epk-secure svg { width: 12px; height: 12px; color: #064e3b; }
        .epk-footer-note {
          text-align: center; font-size: 11.5px;
          color: rgba(12,25,23,0.35); margin-top: 6px;
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
          cursor: pointer; padding: 4px;
          display: flex; align-items: center;
        }

        @media (max-width: 768px) {
          .epk-mobile-nav  { display: flex; }
          .epk-left        { padding: 2.25rem 1.75rem 2rem; }
          .epk-left-logo   { display: none; }
          .epk-left-foot   { display: none; }
          .epk-right       { padding: 2.25rem 1.5rem; align-items: flex-start; }
          .epk-form-card   { max-width: 100%; }
        }
      `}</style>

      {/* Mobile nav */}
      <nav className="epk-mobile-nav">
        <Link href="/" className="epk-mobile-nav-logo"><img src="/logo.webp" alt="Rakhwali PK" style={{height:40,width:"auto",objectFit:"contain",borderRadius:12,background:"rgba(255,255,255,0.9)",padding:6}} /></Link>
        <div className="epk-mobile-nav-icons">
          <button aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
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
            <h1>Secure Account Recovery</h1>
            <p>
              Enter your email address to recover your account.
              A secure link will be sent shortly.
            </p>

            <div className="epk-steps">
              {STEPS.map(({ icon: Icon, label }) => (
                <div key={label} className="epk-step">
                  <div className="epk-step-num">
                    <Icon />
                  </div>
                  <span className="epk-step-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="epk-left-foot">© 2024 Rakhwali PK. All rights reserved.</p>
        </div>

        {/* ── Right panel ── */}
        <div className="epk-right">
          <GridPattern className="epk-right-pattern" />
          <GridPattern className="epk-right-pattern-b" />

          <div className="epk-form-card">

            {sent ? (
              /* ── Success state ── */
              <>
                <div className="epk-success-icon">
                  <MailCheck />
                </div>
                <h1 className="epk-form-title">Check your inbox</h1>
                <p className="epk-form-sub">We sent a password reset link to</p>
                <span className="epk-success-email">{sentTo}</span>
                <p className="epk-success-note">
                  The link will expire in <strong>1 hour</strong>. If you don't see the email, check your spam folder.
                </p>
                <Link href="/auth/login" className="epk-btn" style={{ textDecoration: 'none' }}>
                  Back to sign in
                </Link>
                <button
                  type="button"
                  className="epk-btn-outline"
                  onClick={() => setSent(false)}
                >
                  <RefreshCw size={14} /> Try a different email
                </button>
              </>
            ) : (
              /* ── Form state ── */
              <>
                <h1 className="epk-form-title">Forgot your password?</h1>
                <p className="epk-form-sub">Request a password reset link</p>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <div className="epk-field">
                    <label className="epk-label">Email address</label>
                    <div className="epk-input-wrap">
                      <input
                        {...register('email')}
                        type="email"
                        autoComplete="email"
                        className={cn('epk-input', errors.email && 'error')}
                        placeholder="Enter your email address"
                      />
                      <span className="epk-input-icon" aria-hidden="true">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </span>
                    </div>
                    {errors.email && (
                      <p className="epk-error">{String(errors.email.message)}</p>
                    )}
                  </div>

                  <button type="submit" className="epk-btn" disabled={loading}>
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Sending link…' : 'Send reset link'}
                  </button>
                </form>

                <Link href="/auth/login" className="epk-back">
                  <ArrowLeft />
                  Back to sign in
                </Link>
              </>
            )}

            {/* SSL note */}
            <div className="epk-secure">
              <Lock />
              SSL encrypted · Your data is safe
            </div>
            <p className="epk-footer-note">© 2024 Rakhwali PK. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
}