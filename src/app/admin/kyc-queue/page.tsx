'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, ShieldX, Clock, CheckCircle2, XCircle,
  Eye, Loader2, AlertTriangle, User, Phone, Mail, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatDate, timeAgo, getInitials, cn } from '@/lib/utils';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  submitted: { label: 'Pending Review', color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  icon: <Clock size={12} /> },
  approved:  { label: 'Approved',       color: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200',icon: <CheckCircle2 size={12} /> },
  rejected:  { label: 'Rejected',       color: 'text-red-700',    bg: 'bg-red-50    border-red-200',    icon: <XCircle size={12} /> },
  pending:   { label: 'Not Submitted',  color: 'text-gray-500',   bg: 'bg-gray-50   border-gray-200',   icon: <AlertTriangle size={12} /> },
};

export default function KYCQueuePage() {
  const adminApiEnabled = useAdminApiEnabled();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [imageModal, setImageModal] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc-queue'],
    queryFn: () => api.get('/admin/kyc-queue').then(r => r.data.data),
    enabled: adminApiEnabled,
    refetchInterval: 30000,
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: { userId: string; action: 'approve' | 'reject'; rejectionReason?: string }) =>
      api.post('/admin/kyc/review', payload),
    onSuccess: (_, vars) => {
      toast.success(`KYC ${vars.action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setSelected(null);
      setRejectReason('');
      setShowRejectForm(false);
      qc.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const users = data?.users || [];
  const total = data?.total || 0;

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d2a1f]">KYC Verification Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and verify user identity documents
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <Clock size={14} className="text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">{total} pending</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">

        {/* ── USER LIST ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <ShieldCheck size={24} className="text-emerald-600" />
              </div>
              <p className="font-semibold text-[#0d2a1f] mb-1">All clear!</p>
              <p className="text-sm text-gray-400">No KYC submissions pending review.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user: any) => {
                const cfg = STATUS_CFG[user.kyc?.status || 'pending'];
                const isActive = selected?._id === user._id;
                return (
                  <button
                    key={user._id}
                    onClick={() => { setSelected(user); setShowRejectForm(false); setRejectReason(''); }}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
                      isActive ? 'bg-[#f0f9f4]' : 'hover:bg-gray-50'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#0d2a1f] text-[#c9a15a] text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {getInitials(user.fullName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[#0d2a1f] truncate">{user.fullName}</p>
                        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border', cfg.bg, cfg.color)}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{timeAgo(user.createdAt)}</p>
                      <p className="text-xs text-gray-300 mt-0.5">{user.kyc?.documentType || 'CNIC'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── DETAIL PANEL ── */}
        {selected ? (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-6">
            {/* Panel header */}
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0d2a1f] text-[#c9a15a] text-sm font-bold flex items-center justify-center flex-shrink-0">
                {getInitials(selected.fullName)}
              </div>
              <div>
                <p className="font-semibold text-[#0d2a1f]">{selected.fullName}</p>
                <p className="text-xs text-gray-400">Submitted {timeAgo(selected.createdAt)}</p>
              </div>
            </div>

            {/* User info */}
            <div className="p-5 space-y-3 border-b border-gray-100">
              {[
                { icon: <Mail size={13} />,     label: 'Email',    value: selected.email },
                { icon: <Phone size={13} />,    label: 'Phone',    value: selected.phone },
                { icon: <FileText size={13} />, label: 'Doc Type', value: selected.kyc?.documentType || 'CNIC' },
                { icon: <User size={13} />,     label: 'Doc No.',  value: selected.kyc?.documentNumber || '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-gray-400 flex-shrink-0">{icon}</span>
                  <span className="text-xs text-gray-400 w-16 flex-shrink-0">{label}</span>
                  <span className="text-sm font-medium text-[#0d2a1f] truncate">{value}</span>
                </div>
              ))}
            </div>

            {/* Document images */}
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Identity Documents</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Front', url: selected.kyc?.documentFrontUrl },
                  { label: 'Back',  url: selected.kyc?.documentBackUrl },
                ].map(({ label, url }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-1.5">{label}</p>
                    {url ? (
                      <button
                        onClick={() => setImageModal(url)}
                        className="block w-full aspect-video rounded-xl overflow-hidden border border-gray-200 hover:border-[#0d2a1f] transition-colors relative group"
                      >
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    ) : (
                      <div className="aspect-video rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-xs text-gray-300">Not provided</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {(selected.kyc?.documentFrontUrl || selected.kyc?.documentBackUrl) && (
                <p className="text-xs text-gray-400 mt-2 text-center">Click image to enlarge</p>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 space-y-3">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => reviewMutation.mutate({ userId: selected._id, action: 'approve' })}
                    disabled={reviewMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                  >
                    {reviewMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    disabled={reviewMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 h-10 border border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    <ShieldX size={14} />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Rejection reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Explain why the KYC is rejected (shown to user)…"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                      className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ userId: selected._id, action: 'reject', rejectionReason: rejectReason })}
                      disabled={!rejectReason.trim() || reviewMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {reviewMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />}
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center px-6">
            <ShieldCheck size={32} className="text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Select a user from the list to review their KYC documents</p>
          </div>
        )}
      </div>

      {/* ── IMAGE LIGHTBOX ── */}
      {imageModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setImageModal(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setImageModal(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-medium flex items-center gap-1"
            >
              <XCircle size={16} /> Close
            </button>
            <img src={imageModal} alt="Document" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
