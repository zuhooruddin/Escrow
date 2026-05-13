'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, Shield, CreditCard, Phone, Camera, CheckCircle2,
  AlertTriangle, Upload, ChevronRight, Eye, EyeOff, Save,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getInitials, isValidCNIC, cn } from '@/lib/utils';

type Tab = 'profile' | 'kyc' | 'bank' | 'security';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [kycFront, setKycFront] = useState<File | null>(null);
  const [kycBack, setKycBack]   = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // Profile form
  const profileForm = useForm({ defaultValues: {
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bio: (user as any)?.bio || '',
    city: (user as any)?.city || '',
  }});

  // Bank form
  const bankForm = useForm({ defaultValues: {
    bankName: user?.bankDetails?.bankName || '',
    accountTitle: user?.bankDetails?.accountTitle || '',
    iban: user?.bankDetails?.iban || '',
    accountNumber: (user?.bankDetails as any)?.accountNumber || '',
  }});

  // KYC form
  const kycForm = useForm({ defaultValues: {
    documentType: user?.kyc?.documentType || 'CNIC',
    documentNumber: user?.kyc?.documentNumber || '',
  }});

  // Password form
  const passForm = useForm<{currentPassword:string;newPassword:string;confirmPassword:string}>();

  const profileMutation = useMutation({
    mutationFn: (d: any) => api.patch('/users/profile', d),
    onSuccess: (res) => { updateUser(res.data.data.user); toast.success('Profile updated!'); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const bankMutation = useMutation({
    mutationFn: (d: any) => api.patch('/users/bank-details', d),
    onSuccess: (res) => { updateUser(res.data.data.user); toast.success('Bank details saved!'); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const passMutation = useMutation({
    mutationFn: (d: any) => api.put('/auth/change-password', d),
    onSuccess: () => { toast.success('Password changed. Please log in again.'); passForm.reset(); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const kycMutation = useMutation({
    mutationFn: async (data: any) => {
      setUploading(true);
      let frontUrl = '', backUrl = '';

      if (kycFront) {
        const { data: p } = await api.post('/upload/presign', { filename: kycFront.name, contentType: kycFront.type, folder: 'kyc' });
        await fetch(p.data.uploadUrl, { method: 'PUT', body: kycFront, headers: { 'Content-Type': kycFront.type } });
        frontUrl = p.data.publicUrl;
      }
      if (kycBack) {
        const { data: p } = await api.post('/upload/presign', { filename: kycBack.name, contentType: kycBack.type, folder: 'kyc' });
        await fetch(p.data.uploadUrl, { method: 'PUT', body: kycBack, headers: { 'Content-Type': kycBack.type } });
        backUrl = p.data.publicUrl;
      }
      setUploading(false);
      return api.post('/users/kyc', { ...data, documentFrontUrl: frontUrl, documentBackUrl: backUrl });
    },
    onSuccess: (res) => {
      updateUser(res.data.data.user);
      toast.success('KYC submitted! Admin will verify within 24 hours.');
    },
    onError: e => { setUploading(false); toast.error(getErrorMessage(e)); },
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',  label: 'Profile',       icon: <User size={16} /> },
    { id: 'kyc',      label: 'KYC Verification', icon: <Shield size={16} /> },
    { id: 'bank',     label: 'Bank Details',  icon: <CreditCard size={16} /> },
    { id: 'security', label: 'Security',      icon: <Shield size={16} /> },
  ];

  const kycStatusConfig = {
    pending:   { label: 'Not Submitted',   color: 'text-gray-500',  bg: 'bg-gray-50  border-gray-200' },
    submitted: { label: 'Under Review',    color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    approved:  { label: 'Verified',        color: 'text-upwork-green', bg: 'bg-upwork-green-l border-upwork-green/30' },
    rejected:  { label: 'Rejected',        color: 'text-red-600',   bg: 'bg-red-50   border-red-200' },
  };
  const kycCfg = kycStatusConfig[user?.kyc?.status || 'pending'];

  return (
    <div className="max-w-2xl animate-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">Profile & Settings</h1>
        <p className="section-sub">Manage your account information and verification</p>
      </div>

      {/* Avatar + Name card */}
      <div className="card card-body flex items-center gap-5 mb-6">
        <div className="relative">
          <div className="avatar w-16 h-16 text-xl">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full" />
              : <span>{getInitials(user?.fullName || 'U')}</span>
            }
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">{user?.fullName}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={cn('badge text-xs', kycCfg.bg, kycCfg.color, 'border')}>
              {user?.kyc?.status === 'approved' && <CheckCircle2 size={11} />}
              {user?.kyc?.status !== 'approved' && <AlertTriangle size={11} />}
              {kycCfg.label}
            </span>
            <span className="badge bg-gray-100 text-gray-500 text-xs capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-100 overflow-x-auto scrollbar-thin">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-all',
              activeTab === tab.id
                ? 'text-upwork-green border-upwork-green'
                : 'text-gray-500 border-transparent hover:text-ink'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))}>
          <div className="card card-body space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input {...profileForm.register('fullName')} className="input" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input {...profileForm.register('phone')} className="input" placeholder="03XXXXXXXXX" />
              </div>
            </div>
            <div>
              <label className="label">City</label>
              <input {...profileForm.register('city')} className="input" placeholder="Lahore, Karachi, Islamabad…" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea {...profileForm.register('bio')} rows={3} className="input resize-none" placeholder="Tell others a bit about yourself and your work…" />
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-75">
              <button type="submit" disabled={profileMutation.isPending} className="btn-primary">
                {profileMutation.isPending ? 'Saving…' : (<><Save size={15} /> Save Profile</>)}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── KYC TAB ── */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          {/* Status card */}
          <div className={cn('p-4 rounded-lg border', kycCfg.bg)}>
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center',
                user?.kyc?.status === 'approved' ? 'bg-upwork-green' : 'bg-amber-100'
              )}>
                {user?.kyc?.status === 'approved'
                  ? <CheckCircle2 size={16} className="text-white" />
                  : <Shield size={16} className="text-amber-600" />
                }
              </div>
              <div>
                <p className={cn('text-sm font-semibold', kycCfg.color)}>KYC Status: {kycCfg.label}</p>
                {user?.kyc?.status === 'rejected' && (
                  <p className="text-xs text-red-500 mt-0.5">{(user?.kyc as any)?.rejectionReason}</p>
                )}
                {user?.kyc?.status === 'submitted' && (
                  <p className="text-xs text-amber-600 mt-0.5">Documents under review. You'll be notified within 24 hours.</p>
                )}
              </div>
            </div>
          </div>

          {user?.kyc?.status !== 'approved' && (
            <form onSubmit={kycForm.handleSubmit(d => kycMutation.mutate(d))}>
              <div className="card card-body space-y-5">
                <div>
                  <label className="label">Document Type</label>
                  <select {...kycForm.register('documentType')} className="input">
                    <option value="CNIC">CNIC (Pakistani National ID)</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </div>
                <div>
                  <label className="label">CNIC / Passport Number</label>
                  <input
                    {...kycForm.register('documentNumber')}
                    className="input font-mono"
                    placeholder="XXXXX-XXXXXXX-X"
                  />
                  <p className="text-xs text-gray-400 mt-1">Format: 42201-1234567-1</p>
                </div>

                {/* Front Upload */}
                <div>
                  <label className="label">Front of Document <span className="text-danger">*</span></label>
                  <div
                    onClick={() => frontRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all',
                      kycFront ? 'border-upwork-green bg-upwork-green-l' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input ref={frontRef} type="file" accept="image/*" hidden onChange={e => setKycFront(e.target.files?.[0] || null)} />
                    {kycFront ? (
                      <p className="text-sm text-upwork-green font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> {kycFront.name}
                      </p>
                    ) : (
                      <div>
                        <Upload size={20} className="mx-auto text-gray-300 mb-1.5" />
                        <p className="text-sm text-gray-400">Upload front of CNIC / Passport</p>
                        <p className="text-xs text-gray-300 mt-1">PNG or JPG</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Upload */}
                <div>
                  <label className="label">Back of Document</label>
                  <div
                    onClick={() => backRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all',
                      kycBack ? 'border-upwork-green bg-upwork-green-l' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input ref={backRef} type="file" accept="image/*" hidden onChange={e => setKycBack(e.target.files?.[0] || null)} />
                    {kycBack ? (
                      <p className="text-sm text-upwork-green font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> {kycBack.name}
                      </p>
                    ) : (
                      <div>
                        <Upload size={20} className="mx-auto text-gray-300 mb-1.5" />
                        <p className="text-sm text-gray-400">Upload back of CNIC (optional for passport)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-75">
                  <button
                    type="submit"
                    disabled={kycMutation.isPending || uploading || !kycFront}
                    className="btn-primary"
                  >
                    {(kycMutation.isPending || uploading) ? 'Submitting…' : (<><Shield size={15} /> Submit for Verification</>)}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── BANK TAB ── */}
      {activeTab === 'bank' && (
        <form onSubmit={bankForm.handleSubmit(d => bankMutation.mutate(d))}>
          <div className="card card-body space-y-5">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                Bank details are required to receive payouts from completed deals. All payouts are processed within 24 hours of deal approval.
              </p>
            </div>
            <div>
              <label className="label">Bank Name</label>
              <input {...bankForm.register('bankName')} className="input" placeholder="Meezan Bank, HBL, UBL, MCB…" />
            </div>
            <div>
              <label className="label">Account Title</label>
              <input {...bankForm.register('accountTitle')} className="input" placeholder="Exactly as on your bank account" />
            </div>
            <div>
              <label className="label">IBAN Number</label>
              <input {...bankForm.register('iban')} className="input font-mono" placeholder="PKXX XXXX XXXX XXXX XXXX XXXX" />
            </div>
            <div>
              <label className="label">Account Number</label>
              <input {...bankForm.register('accountNumber')} className="input font-mono" placeholder="Your bank account number" />
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-75">
              <button type="submit" disabled={bankMutation.isPending} className="btn-primary">
                {bankMutation.isPending ? 'Saving…' : (<><Save size={15} /> Save Bank Details</>)}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === 'security' && (
        <form onSubmit={passForm.handleSubmit(d => passMutation.mutate(d))}>
          <div className="card card-body space-y-5">
            <h3 className="text-base font-semibold text-ink">Change Password</h3>
            {(['currentPassword','newPassword','confirmPassword'] as const).map(field => {
              const labels: Record<string, string> = {
                currentPassword: 'Current Password',
                newPassword: 'New Password',
                confirmPassword: 'Confirm New Password',
              };
              return (
                <div key={field}>
                  <label className="label">{labels[field]}</label>
                  <input
                    {...passForm.register(field)}
                    type="password"
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
              );
            })}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                Changing your password will log you out of all other devices.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-75">
              <button type="submit" disabled={passMutation.isPending} className="btn-primary">
                {passMutation.isPending ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
