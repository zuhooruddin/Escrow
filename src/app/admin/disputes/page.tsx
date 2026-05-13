'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { AlertTriangle, ChevronRight, ArrowLeft, Loader2, CheckCircle2, FileText, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate, timeAgo, getInitials, cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';

export default function AdminDisputesPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const [selected, setSelected] = useState<any>(null);
  const [verdict, setVerdict] = useState('');
  const [reason, setReason] = useState('');
  const [partial, setPartial] = useState(50);
  const [filter, setFilter] = useState('pending');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', filter],
    queryFn: () => api.get(`/admin/disputes?verdict=${filter}&limit=50`).then(r => r.data.data),
    refetchInterval: 30000,
    enabled: adminApiEnabled,
  });

  const { data: dealDetail } = useQuery({
    queryKey: ['admin-deal-detail', selected?._id],
    queryFn: () => api.get(`/admin/deals/${selected._id}`).then(r => r.data.data),
    enabled: adminApiEnabled && !!selected,
  });

  const resolveMutation = useMutation({
    mutationFn: () => api.post(`/disputes/${selected._id}/resolve`, {
      verdict,
      verdictReason: reason,
      partialRefundPercent: verdict === 'partial_refund' ? partial : undefined,
    }),
    onSuccess: () => {
      toast.success('Dispute resolved!');
      setSelected(null);
      setVerdict('');
      setReason('');
      qc.invalidateQueries({ queryKey: ['admin-disputes'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const disputes = data?.deals || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">

        {selected ? (
          /* ── DISPUTE DETAIL VIEW ── */
          <div className="max-w-3xl animate-in">
            <button onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-5">
              <ArrowLeft size={16} /> Back to disputes
            </button>

            {/* Deal header */}
            <div className="card card-body mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">{selected.dealNumber}</p>
                  <h2 className="text-xl font-semibold text-ink mb-2">{selected.title}</h2>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>Amount: <strong className="text-ink">{formatPKR(selected.amountInPaisa)}</strong></span>
                    <span>Raised: <strong>{timeAgo(selected.disputedAt)}</strong></span>
                  </div>
                </div>
                <span className="badge bg-red-50 text-red-600 border border-red-200">DISPUTED</span>
              </div>
            </div>

            {/* Both parties */}
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {[
                { label: 'Buyer', user: selected.buyer, role: 'Raised dispute' },
                { label: 'Seller', user: selected.seller, role: 'Delivered work' },
              ].map(({ label, user, role }) => (
                <div key={label} className="card card-body">
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">{label}</p>
                  <div className="flex items-center gap-3">
                    <div className="avatar w-9 h-9 text-sm">
                      <span>{getInitials(user?.fullName || 'U')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{user?.fullName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-xs text-gray-400">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dispute content */}
            <div className="space-y-4 mb-5">
              <div className="card card-body border-red-200 bg-red-50/30">
                <p className="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Buyer's Complaint
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.dispute?.buyerReason}</p>
                {selected.dispute?.buyerEvidence?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-500">Evidence files:</p>
                    {selected.dispute.buyerEvidence.map((f: any, i: number) => (
                      <a key={i} href={f.r2Url} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                        <FileText size={12} /> {f.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {selected.dispute?.sellerResponse ? (
                <div className="card card-body border-blue-200 bg-blue-50/30">
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-2 flex items-center gap-1">
                    Seller's Response
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.dispute.sellerResponse}</p>
                  {selected.dispute?.sellerEvidence?.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-gray-500">Evidence files:</p>
                      {selected.dispute.sellerEvidence.map((f: any, i: number) => (
                        <a key={i} href={f.r2Url} target="_blank" rel="noopener" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                          <FileText size={12} /> {f.filename}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="card card-body bg-amber-50 border-amber-200">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <AlertTriangle size={14} /> Seller has not responded yet
                  </p>
                </div>
              )}
            </div>

            {/* Verdict form */}
            {!selected.dispute?.verdict && (
              <div className="card card-body border-2 border-upwork-green/30">
                <h3 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                  <Scale size={16} className="text-upwork-green" /> Issue Verdict
                </h3>

                <div className="space-y-3 mb-4">
                  {[
                    { value: 'release_to_seller',   label: 'Release to Seller',     desc: `Seller receives ${formatPKR(selected.sellerPayoutInPaisa)}. Buyer receives nothing.`, color: 'border-upwork-green' },
                    { value: 'partial_refund',       label: 'Partial Refund',        desc: 'Split funds between buyer and seller.',                                                   color: 'border-amber-400' },
                    { value: 'full_refund_to_buyer', label: 'Full Refund to Buyer',  desc: `Buyer receives ${formatPKR(selected.amountInPaisa)}. Seller receives nothing.`,         color: 'border-red-400' },
                  ].map(opt => (
                    <label key={opt.value} className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                      verdict === opt.value ? `${opt.color} bg-gray-50` : 'border-gray-150 hover:border-gray-300'
                    )}>
                      <input type="radio" name="verdict" value={opt.value} checked={verdict === opt.value}
                        onChange={e => setVerdict(e.target.value)} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {verdict === 'partial_refund' && (
                  <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <label className="label text-amber-700">Buyer Refund Percentage: {partial}%</label>
                    <input type="range" min={1} max={99} value={partial} onChange={e => setPartial(Number(e.target.value))} className="w-full" />
                    <div className="flex justify-between text-xs text-amber-600 mt-2">
                      <span>Buyer gets: {formatPKR(Math.round(selected.amountInPaisa * partial / 100))}</span>
                      <span>Seller gets: {formatPKR(Math.round(selected.amountInPaisa * (100 - partial) / 100))}</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="label">Verdict Reason <span className="text-danger">*</span></label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="input resize-none"
                    placeholder="Explain your decision clearly. This will be sent to both parties and stored in the audit log."
                  />
                  <p className="text-xs text-gray-400 mt-1">{reason.length}/20 minimum characters</p>
                </div>

                <button
                  onClick={() => resolveMutation.mutate()}
                  disabled={!verdict || reason.length < 20 || resolveMutation.isPending}
                  className="btn-primary w-full"
                >
                  {resolveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
                  {resolveMutation.isPending ? 'Processing…' : 'Issue Final Verdict'}
                </button>
              </div>
            )}

            {selected.dispute?.verdict && (
              <div className="card card-body bg-upwork-green-l border-upwork-green/30">
                <p className="text-sm font-semibold text-upwork-green flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} /> Verdict Already Issued
                </p>
                <p className="text-sm text-gray-600 capitalize">{selected.dispute.verdict.replace(/_/g, ' ')}</p>
                <p className="text-xs text-gray-500 mt-1">{selected.dispute.verdictReason}</p>
              </div>
            )}
          </div>
        ) : (
          /* ── DISPUTES LIST ── */
          <div className="animate-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="section-title">Dispute Management</h1>
                <p className="section-sub">{disputes.length} {filter} disputes</p>
              </div>
              <div className="flex gap-2">
                {['pending','resolved'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all',
                    filter === f ? 'bg-upwork-green text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}>{f}</button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="card card-body h-24 animate-pulse bg-gray-50" />)}
              </div>
            ) : !disputes.length ? (
              <div className="card card-body flex flex-col items-center justify-center py-20 text-center">
                <CheckCircle2 size={40} className="text-upwork-green mb-3" />
                <h3 className="text-lg font-semibold text-ink mb-1">No {filter} disputes</h3>
                <p className="text-sm text-gray-400">All disputes have been resolved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((d: any) => (
                  <button key={d._id} onClick={() => setSelected(d)}
                    className="card card-hover w-full text-left">
                    <div className="card-body flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={18} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-ink truncate">{d.title}</p>
                          {d.dispute?.verdict && <span className="badge bg-upwork-green-l text-upwork-green text-xs">Resolved</span>}
                        </div>
                        <p className="text-xs text-gray-500">
                          {d.dealNumber} · {formatPKR(d.amountInPaisa)} · Raised {timeAgo(d.disputedAt)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {d.buyer?.fullName} vs {d.seller?.fullName}
                          {d.dispute?.sellerResponse ? '' : ' · ⚠ Seller not responded'}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
