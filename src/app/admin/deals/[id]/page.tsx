'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft, Flag, CheckCircle2, AlertTriangle, Clock,
  FileText, ExternalLink, Wallet, Loader2, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDateFull, formatDate, timeAgo, getInitials, cn } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

export default function AdminDealDetailPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const { id } = useParams();
  const qc = useQueryClient();
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deal', id],
    queryFn: () => api.get(`/admin/deals/${id}`).then(r => r.data.data),
    enabled: adminApiEnabled && !!id,
  });

  const payoutMutation = useMutation({
    mutationFn: () => api.post('/admin/payouts/initiate', { dealId: id, referenceNumber: payoutRef, payoutMethod }),
    onSuccess: () => {
      toast.success('Payout recorded!');
      setShowPayoutForm(false);
      qc.invalidateQueries({ queryKey: ['admin-deal', id] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const flagMutation = useMutation({
    mutationFn: () => api.post('/admin/deals/flag', { dealId: id, reason: flagReason }),
    onSuccess: () => { toast.success('Deal flagged'); qc.invalidateQueries({ queryKey: ['admin-deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const ibftMutation = useMutation({
    mutationFn: () => api.patch(`/payments/${id}/ibft/confirm`),
    onSuccess: () => { toast.success('IBFT confirmed. Deal funded!'); qc.invalidateQueries({ queryKey: ['admin-deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return (
    <div className="p-6 space-y-4">
      <div className="h-5 w-32 bg-gray-100 rounded-lg animate-pulse" />
      <div className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      </div>
    </div>
  );

  const deal     = data?.deal;
  const auditLog = data?.auditLog || [];
  if (!deal) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-5">

      {/* Back */}
      <Link
        href="/admin/deals"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={15} /> Back to all deals
      </Link>

      {/* Deal header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={deal.status} size="md" />
              <span className="text-xs text-gray-400 font-mono">{deal.dealNumber}</span>
              {deal.flagged && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Flag size={10} /> Flagged
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-1">{deal.title}</h1>
            <p className="text-sm text-gray-500">
              {deal.category} · Created {timeAgo(deal.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatPKR(deal.amountInPaisa)}</p>
            <p className="text-sm font-semibold text-emerald-600">Seller gets: {formatPKR(deal.sellerPayoutInPaisa)}</p>
            <p className="text-xs text-gray-400">Fee: {formatPKR(deal.platformFeeInPaisa)}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-4">

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Buyer',  user: deal.buyer,  role: 'Paying party' },
              { label: 'Seller', user: deal.seller, role: 'Working party' },
            ].map(({ label, user, role }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {getInitials(user?.fullName || 'U')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{user?.fullName}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                    <p className="text-xs text-gray-400">{user?.phone}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>KYC: <span className={cn('font-semibold', user?.kyc?.status === 'approved' ? 'text-emerald-600' : 'text-amber-600')}>{user?.kyc?.status}</span></p>
                  {user?.bankDetails?.iban && <p className="font-mono text-gray-400">{user.bankDetails.bankName}: {user.bankDetails.iban}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <Section title="Deal Description">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
          </Section>

          {/* Payment info */}
          {deal.payment?.method && (
            <Section title="Payment Info">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  ['Method', deal.payment.method?.replace('_',' ').toUpperCase()],
                  ['Transaction ID', deal.payment.transactionId || '—'],
                  ['Gateway Ref', deal.payment.gatewayReference || '—'],
                  ['Paid At', deal.payment.paidAt ? formatDate(deal.payment.paidAt) : '—'],
                ].map(([k,v]) => (
                  <div key={k}>
                    <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                    <p className="text-xs font-semibold text-gray-800 font-mono">{v}</p>
                  </div>
                ))}
              </div>
              {deal.payment.ibftScreenshotUrl && (
                <a href={deal.payment.ibftScreenshotUrl} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  <ExternalLink size={13} /> View Bank Transfer Screenshot
                </a>
              )}
              {deal.status === 'PENDING' && deal.payment.method === 'bank_transfer' && !deal.payment.ibftConfirmedBy && (
                <button
                  onClick={() => { if (confirm('Confirm this bank transfer and fund the deal?')) ibftMutation.mutate(); }}
                  disabled={ibftMutation.isPending}
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {ibftMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Confirm & Fund Deal
                </button>
              )}
            </Section>
          )}

          {/* Deliverables */}
          {deal.deliverables?.submittedAt && (
            <Section title="Deliverables">
              {deal.deliverables.note && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">{deal.deliverables.note}</p>
              )}
              <div className="space-y-2">
                {deal.deliverables.files?.map((f: any, i: number) => (
                  <a key={i} href={f.r2Url} target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <FileText size={14} /> {f.originalName}
                  </a>
                ))}
                {deal.deliverables.links?.map((l: any, i: number) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <ExternalLink size={14} /> {l.url}
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* Dispute */}
          {deal.dispute?.buyerReason && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <AlertTriangle size={12} /> Dispute Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Buyer's Reason</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute.buyerReason}</p>
                </div>
                {deal.dispute.sellerResponse && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Seller's Response</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute.sellerResponse}</p>
                  </div>
                )}
                {deal.dispute.verdict ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-xs font-bold text-emerald-700 mb-1">Verdict: {deal.dispute.verdict.replace(/_/g,' ')}</p>
                    <p className="text-xs text-gray-600">{deal.dispute.verdictReason}</p>
                    <p className="text-xs text-gray-400 mt-1">By {deal.dispute.verdictBy?.fullName} · {deal.dispute.verdictAt ? formatDate(deal.dispute.verdictAt) : ''}</p>
                  </div>
                ) : (
                  <Link href="/admin/disputes"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl transition-colors">
                    <Shield size={14} /> Go to Dispute Resolution
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Audit log */}
          <Section title="Full Audit Trail">
            <div className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-100" />
              <div className="space-y-4">
                {auditLog.map((log: any, i: number) => (
                  <div key={i} className="flex gap-4 pl-6 relative">
                    <div className="absolute left-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-300 flex items-center justify-center top-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-800 leading-snug">{log.action}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDateFull(log.timestamp)}</span>
                        {log.triggeredBy && <span className="text-xs text-gray-400">· {log.triggeredBy.fullName || 'System'}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Admin actions */}
        <div className="space-y-4">

          {/* Timeline */}
          <Section title="Timeline">
            <div className="space-y-3">
              {[
                { label: 'Created',   date: deal.createdAt,        done: true },
                { label: 'Accepted',  date: deal.sellerAcceptedAt, done: !!deal.sellerAcceptedAt },
                { label: 'Funded',    date: deal.fundedAt,         done: !!deal.fundedAt },
                { label: 'Delivered', date: deal.deliveredAt,      done: !!deal.deliveredAt },
                { label: 'Disputed',  date: deal.disputedAt,       done: !!deal.disputedAt },
                { label: 'Completed', date: deal.completedAt,      done: !!deal.completedAt },
                { label: 'Refunded',  date: deal.refundedAt,       done: !!deal.refundedAt },
              ].filter(t => t.done || t.label === 'Completed').map(({ label, date, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                    done ? 'bg-emerald-600' : 'bg-gray-100'
                  )}>
                    {done && <CheckCircle2 size={11} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-xs font-semibold', done ? 'text-gray-900' : 'text-gray-300')}>{label}</p>
                    {date && <p className="text-xs text-gray-400">{formatDate(date)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Payout */}
          <Section title="Payout">
            {deal.payout?.completedAt ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm mb-2">
                  <CheckCircle2 size={14} /> Payout Completed
                </div>
                <p className="text-xs text-gray-500">Method: {deal.payout.method}</p>
                <p className="text-xs text-gray-500 font-mono">Ref: {deal.payout.referenceNumber}</p>
                <p className="text-xs text-gray-400">{formatDate(deal.payout.completedAt)}</p>
              </div>
            ) : ['COMPLETED','REFUNDED'].includes(deal.status) ? (
              showPayoutForm ? (
                <div className="space-y-3">
                  <select
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="raast">Raast</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">EasyPaisa</option>
                  </select>
                  <input
                    value={payoutRef}
                    onChange={e => setPayoutRef(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-mono transition-all"
                    placeholder="Transfer reference number"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowPayoutForm(false)}
                      className="flex-1 h-9 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => payoutMutation.mutate()}
                      disabled={!payoutRef || payoutMutation.isPending}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {payoutMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                      Record
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-amber-600 font-medium mb-3">Payout not yet recorded</p>
                  <button
                    onClick={() => setShowPayoutForm(true)}
                    className="w-full h-9 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
                  >
                    <Wallet size={14} /> Record Payout
                  </button>
                </div>
              )
            ) : (
              <p className="text-xs text-gray-400">Payout available after deal completes</p>
            )}
          </Section>

          {/* Flag deal */}
          {!deal.flagged && (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Admin Actions</h3>
              <div className="space-y-2">
                <input
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value)}
                  className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-400 transition-all"
                  placeholder="Reason for flagging…"
                />
                <button
                  onClick={() => flagMutation.mutate()}
                  disabled={!flagReason || flagMutation.isPending}
                  className="w-full h-9 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Flag size={14} /> Flag This Deal
                </button>
              </div>
            </div>
          )}

          {/* Dispute link */}
          {deal.status === 'DISPUTED' && (
            <Link
              href="/admin/disputes"
              className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between hover:bg-red-100 transition-colors group"
            >
              <div>
                <p className="text-sm font-bold text-red-600">Open Dispute</p>
                <p className="text-xs text-red-400">Requires admin verdict</p>
              </div>
              <Shield size={18} className="text-red-400 group-hover:text-red-600 transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
