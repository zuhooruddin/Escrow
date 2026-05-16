'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, Smartphone, Copy, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'disable'>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [copied, setCopied] = useState(false);

  const setupMutation = useMutation({
    mutationFn: () => api.post('/2fa/setup'),
    onSuccess: (res) => {
      setQrCode(res.data.data.qrCode);
      setSecret(res.data.data.secret);
      setStep('setup');
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const enableMutation = useMutation({
    mutationFn: () => api.post('/2fa/enable', { token }),
    onSuccess: () => {
      toast.success('2FA enabled! Your admin account is now protected.');
      setStep('idle');
      setToken('');
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const disableMutation = useMutation({
    mutationFn: () => api.post('/2fa/disable', { token: disableToken }),
    onSuccess: () => {
      toast.success('2FA disabled.');
      setStep('idle');
      setDisableToken('');
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const twoFAEnabled = (user as any)?.twofa_enabled;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0d2a1f] mb-1">Admin Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Manage security settings for your admin account</p>

      {/* ── 2FA CARD ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
              twoFAEnabled ? 'bg-emerald-50' : 'bg-amber-50'
            )}>
              {twoFAEnabled
                ? <ShieldCheck size={22} className="text-emerald-600" />
                : <AlertTriangle size={22} className="text-amber-600" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-[#0d2a1f]">Two-Factor Authentication (2FA)</h2>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {twoFAEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {twoFAEnabled
                  ? 'Your admin account requires a 6-digit TOTP code on every login.'
                  : 'Required for admin accounts. Add an extra layer of security using an authenticator app.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">

          {/* ── IDLE STATE ── */}
          {step === 'idle' && (
            <div className="space-y-4">
              {!twoFAEnabled && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <strong>Required:</strong> 2FA is mandatory for all admin accounts. Enable it now to protect the platform.
                </div>
              )}
              <div className="flex gap-3">
                {!twoFAEnabled ? (
                  <button
                    onClick={() => setupMutation.mutate()}
                    disabled={setupMutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0d2a1f] text-white text-sm font-semibold rounded-xl hover:bg-[#153d30] transition-colors disabled:opacity-60"
                  >
                    {setupMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Smartphone size={15} />}
                    Set Up 2FA
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('disable')}
                    className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <ShieldOff size={15} />
                    Disable 2FA
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── SETUP STEP 1: QR Code ── */}
          {step === 'setup' && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-[#0d2a1f] mb-1">Step 1 — Scan QR Code</p>
                <p className="text-sm text-gray-500 mb-4">
                  Open <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app and scan this QR code.
                </p>
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="2FA QR Code" className="w-52 h-52 rounded-xl border border-gray-200 p-2" />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0d2a1f] mb-1">Can't scan? Enter manually</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <code className="flex-1 text-xs text-gray-600 font-mono break-all">{secret}</code>
                  <button onClick={copySecret} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                    {copied ? <CheckCircle2 size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0d2a1f] mb-1">Step 2 — Enter 6-digit code</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-12 px-4 text-center text-2xl font-mono tracking-widest border border-gray-200 rounded-xl outline-none focus:border-[#0d2a1f] focus:ring-2 focus:ring-[#0d2a1f]/10 bg-gray-50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('idle'); setToken(''); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => enableMutation.mutate()}
                  disabled={token.length !== 6 || enableMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0d2a1f] text-white text-sm font-semibold rounded-xl hover:bg-[#153d30] transition-colors disabled:opacity-50"
                >
                  {enableMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {/* ── DISABLE ── */}
          {step === 'disable' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                <strong>Warning:</strong> Disabling 2FA reduces the security of your admin account.
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0d2a1f] mb-1">
                  Enter your current 6-digit 2FA code to confirm
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={disableToken}
                  onChange={e => setDisableToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full h-12 px-4 text-center text-2xl font-mono tracking-widest border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 bg-gray-50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStep('idle'); setDisableToken(''); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => disableMutation.mutate()}
                  disabled={disableToken.length !== 6 || disableMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {disableMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <ShieldOff size={15} />}
                  Disable 2FA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GUIDE ── */}
      <div className="mt-6 bg-[#f5f3ee] rounded-2xl p-5">
        <h3 className="text-sm font-bold text-[#0d2a1f] mb-2">Recommended Authenticator Apps</h3>
        <ul className="text-sm text-gray-500 space-y-1.5">
          <li>• <strong>Google Authenticator</strong> — iOS & Android (free)</li>
          <li>• <strong>Authy</strong> — iOS & Android, supports cloud backup</li>
          <li>• <strong>Microsoft Authenticator</strong> — iOS & Android</li>
        </ul>
      </div>
    </div>
  );
}
