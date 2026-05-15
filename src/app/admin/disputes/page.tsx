'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronRight, ArrowLeft, Loader2, CheckCircle2, FileText, Scale } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate, timeAgo, getInitials, cn } from '@/lib/utils';

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

  if (selected) {
    return (
      <div className="p-6 max-w-3xl space-y-5">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} /> Back to disputes
        </button>

        {/* Deal header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 font-mono mb-1">{selected.dealNumber}</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selected.title}</h2>
              <div className="flex gap-5 text-sm text-gray-500">
                <span>Amount: <strong className="text-gray-900">{formatPKR(selected.amountInPaisa)}</strong></span>
                <span>Raised: <strong className="text-gray-700">{timeAgo(selected.disputedAt)}</strong></span>
              </div>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">DISPUTED</span>
          </div>
        </div>

        {/* Parties */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Buyer', user: selected.buyer, role: 'Raised dispute' },
            { label: 'Seller', user: selected.seller, role: 'Delivered work' },
          ].map(({ label, user, role }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(user?.fullName || 'U')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dispute content */}
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12} /> Buyer's Complaint
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.dispute?.buyerReason}</p>
            {selected.dispute?.buyerEvidence?.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500">Evidence files:</p>
                {selected.dispute.buyerEvidence.map((f: any, i: number) => (
                  <a key={i} href={f.r2Url} target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline font-medium">
                    <FileText size={12} /> {f.filename}
                  </a>
                ))}
              </div>
            )}
          </div>

          {selected.dispute?.sellerResponse ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Seller's Response</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.dispute.sellerResponse}</p>
              {selected.dispute?.sellerEvidence?.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500">Evidence files:</p>
                  {selected.dispute.sellerEvidence.map((f: any, i: number) => (
                    <a key={i} href={f.r2Url} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:underline font-medium">
                      <FileText size={12} /> {f.filename}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm font-medium text-amber-700">Seller has not responded yet</p>
            </div>
          )}
        </div>

        {/* Verdict form */}
        {!selected.dispute?.verdict ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale size={16} className="text-emerald-600" /> Issue Verdict
            </h3>

            <div className="space-y-3 mb-5">
              {[
                { value: 'release_to_seller',   label: 'Release to Seller',    desc: `Seller receives ${formatPKR(selected.sellerPayoutInPaisa)}.`, activeClass: 'border-emerald-500 bg-emerald-50' },
                { value: 'partial_refund',       label: 'Partial Refund',       desc: 'Split funds between buyer and seller.',                        activeClass: 'border-amber-400 bg-amber-50' },
                { value: 'full_refund_to_buyer', label: 'Full Refund to Buyer', desc: `Buyer receives ${formatPKR(selected.amountInPaisa)}.`,         activeClass: 'border-red-400 bg-red-50' },
              ].map(opt => (
                <label key={opt.value} className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                  verdict === opt.value ? opt.activeClass : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                )}>
                  <input type="radio" name="verdict" value={opt.value} checked={verdict === opt.value}
                    onChange={e => setVerdict(e.target.value)} className="mt-0.5 accent-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {verdict === 'partial_refund' && (
              <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <label className="block text-xs font-bold text-amber-700 mb-2">Buyer Refund: {partial}%</label>
                <input type="range" min={1} max={99} value={partial} onChange={e => setPartial(Number(e.target.value))}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-xs text-amber-600 mt-2 font-medium">
                  <span>Buyer gets: {formatPKR(Math.round(selected.amountInPaisa * partial / 100))}</span>
                  <span>Seller gets: {formatPKR(Math.round(selected.amountInPaisa * (100 - partial) / 100))}</span>
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Verdict Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 resize-none transition-all"
                placeholder="Explain your decision clearly. This will be sent to both parties."
              />
              <p className="text-xs text-gray-400 mt-1">{reason.length}/20 minimum characters</p>
            </div>

            <button
              onClick={() => resolveMutation.mutate()}
              disabled={!verdict || reason.length < 20 || resolveMutation.isPending}
              className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Scale size={16} />}
              {resolveMutation.isPending ? 'Processing…' : 'Issue Final Verdict'}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <p className="text-sm font-bold text-emerald-700">Verdict Already Issued</p>
            </div>
            <p className="text-sm text-gray-700 capitalize">{selected.dispute.verdict.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{selected.dispute.verdictReason}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dispute Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{disputes.length} {filter} disputes</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {['pending', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all',
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >{f}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm h-24 animate-pulse" />
          ))}
        </div>
      ) : !disputes.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No {filter} disputes</h3>
          <p className="text-sm text-gray-400">All disputes have been resolved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d: any) => (
            <button
              key={d._id}
              onClick={() => setSelected(d)}
              className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left group"
            >
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{d.title}</p>
                    {d.dispute?.verdict && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">Resolved</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-mono">{d.dealNumber}</span>
                    {' · '}{formatPKR(d.amountInPaisa)}{' · '}Raised {timeAgo(d.disputedAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {d.buyer?.fullName} vs {d.seller?.fullName}
                    {!d.dispute?.sellerResponse && (
                      <span className="text-amber-500 font-medium"> · ⚠ Seller not responded</span>
                    )}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
