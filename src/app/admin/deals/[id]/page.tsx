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
import Navbar from '@/components/layout/Navbar';

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
    mutationFn: () => api.post('/admin/payouts/initiate', {
      dealId: id, referenceNumber: payoutRef, payoutMethod,
    }),
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">
        <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card card-body h-64 animate-pulse bg-gray-50" />
          <div className="card card-body h-64 animate-pulse bg-gray-50" />
        </div>
      </div>
    </div>
  );

  const deal     = data?.deal;
  const auditLog = data?.auditLog || [];
  if (!deal) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">

        {/* Back */}
        <Link href="/admin/deals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to all deals
        </Link>

        {/* Deal header card */}
        <div className="card card-body mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={deal.status} size="md" />
                <span className="text-xs text-gray-400 font-mono">{deal.dealNumber}</span>
                {deal.flagged && (
                  <span className="badge bg-red-50 text-red-600 border border-red-200 text-xs">
                    <Flag size={10} /> Flagged
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-ink tracking-tight mb-1">{deal.title}</h1>
              <p className="text-sm text-gray-500">
                Category: {deal.category} · Created {timeAgo(deal.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-ink tracking-tight">{formatPKR(deal.amountInPaisa)}</p>
              <p className="text-sm text-upwork-green font-medium">Seller gets: {formatPKR(deal.sellerPayoutInPaisa)}</p>
              <p className="text-xs text-gray-400">Fee: {formatPKR(deal.platformFeeInPaisa)}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Parties */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'BUYER', user: deal.buyer, role: 'Paying party' },
                { label: 'SELLER', user: deal.seller, role: 'Working party' },
              ].map(({ label, user, role }) => (
                <div key={label} className="card card-body">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar w-10 h-10 text-sm">
                      <span>{getInitials(user?.fullName || 'U')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{user?.fullName}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                      <p className="text-xs text-gray-400">{user?.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>KYC: <span className={cn('font-medium', user?.kyc?.status === 'approved' ? 'text-upwork-green' : 'text-amber-600')}>{user?.kyc?.status}</span></p>
                    {user?.bankDetails?.iban && <p className="font-mono">{user.bankDetails.bankName}: {user.bankDetails.iban}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card card-body">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Deal Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
            </div>

            {/* Payment info */}
            {deal.payment?.method && (
              <div className="card card-body">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Method', deal.payment.method?.replace('_',' ').toUpperCase()],
                    ['Transaction ID', deal.payment.transactionId || '—'],
                    ['Gateway Ref', deal.payment.gatewayReference || '—'],
                    ['Paid At', deal.payment.paidAt ? formatDate(deal.payment.paidAt) : '—'],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <p className="text-xs text-gray-400">{k}</p>
                      <p className="font-medium text-ink font-mono text-xs">{v}</p>
                    </div>
                  ))}
                </div>
                {deal.payment.ibftScreenshotUrl && (
                  <a href={deal.payment.ibftScreenshotUrl} target="_blank" rel="noopener"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                    <ExternalLink size={13} /> View Bank Transfer Screenshot
                  </a>
                )}
                {/* Confirm IBFT button */}
                {deal.status === 'PENDING' && deal.payment.method === 'bank_transfer' && !deal.payment.ibftConfirmedBy && (
                  <button
                    onClick={() => { if (confirm('Confirm this bank transfer and fund the deal?')) ibftMutation.mutate(); }}
                    disabled={ibftMutation.isPending}
                    className="mt-3 btn-primary text-sm px-4 py-2"
                  >
                    {ibftMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                    Confirm & Fund Deal
                  </button>
                )}
              </div>
            )}

            {/* Deliverables */}
            {deal.deliverables?.submittedAt && (
              <div className="card card-body">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Deliverables</h3>
                {deal.deliverables.note && (
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{deal.deliverables.note}</p>
                )}
                <div className="space-y-2">
                  {deal.deliverables.files?.map((f: any, i: number) => (
                    <a key={i} href={f.r2Url} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <FileText size={14} /> {f.originalName}
                    </a>
                  ))}
                  {deal.deliverables.links?.map((l: any, i: number) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                      <ExternalLink size={14} /> {l.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Dispute */}
            {deal.dispute?.buyerReason && (
              <div className="card card-body border-red-200">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Dispute Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Buyer's Reason</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute.buyerReason}</p>
                  </div>
                  {deal.dispute.sellerResponse && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">Seller's Response</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute.sellerResponse}</p>
                    </div>
                  )}
                  {deal.dispute.verdict && (
                    <div className="p-3 bg-upwork-green-l border border-upwork-green/30 rounded-lg">
                      <p className="text-xs font-semibold text-upwork-green mb-1">Verdict: {deal.dispute.verdict.replace(/_/g,' ')}</p>
                      <p className="text-xs text-gray-600">{deal.dispute.verdictReason}</p>
                      <p className="text-xs text-gray-400 mt-1">By {deal.dispute.verdictBy?.fullName} · {deal.dispute.verdictAt ? formatDate(deal.dispute.verdictAt) : ''}</p>
                    </div>
                  )}
                  {!deal.dispute.verdict && (
                    <Link href="/admin/disputes" className="btn-danger text-sm px-4 py-2 inline-flex items-center gap-1.5">
                      <Shield size={14} /> Go to Dispute Resolution
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Audit log */}
            <div className="card card-body">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Full Audit Trail</h3>
              <div className="relative">
                <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {auditLog.map((log: any, i: number) => (
                    <div key={i} className="flex gap-4 pl-7 relative">
                      <div className="absolute left-0 w-5 h-5 rounded-full bg-white border-2 border-upwork-green/40 flex items-center justify-center top-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-upwork-green" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-ink leading-snug">{log.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{formatDateFull(log.timestamp)}</span>
                          {log.triggeredBy && <span className="text-xs text-gray-400">· {log.triggeredBy.fullName || 'System'} ({log.triggeredByRole})</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Admin actions */}
          <div className="space-y-4">

            {/* Timeline */}
            <div className="card card-body">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Timeline</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Created',   date: deal.createdAt,       done: true },
                  { label: 'Accepted',  date: deal.sellerAcceptedAt,done: !!deal.sellerAcceptedAt },
                  { label: 'Funded',    date: deal.fundedAt,        done: !!deal.fundedAt },
                  { label: 'Delivered', date: deal.deliveredAt,     done: !!deal.deliveredAt },
                  { label: 'Disputed',  date: deal.disputedAt,      done: !!deal.disputedAt },
                  { label: 'Completed', date: deal.completedAt,     done: !!deal.completedAt },
                  { label: 'Refunded',  date: deal.refundedAt,      done: !!deal.refundedAt },
                ].filter(t => t.done || t.label === 'Completed').map(({ label, date, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={cn('w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0',
                      done ? 'bg-upwork-green' : 'bg-gray-100'
                    )}>
                      {done && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={cn('text-xs font-medium', done ? 'text-ink' : 'text-gray-300')}>{label}</p>
                      {date && <p className="text-xs text-gray-400">{formatDate(date)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout info */}
            <div className="card card-body">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payout</h3>
              {deal.payout?.completedAt ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1.5 text-upwork-green font-medium mb-2">
                    <CheckCircle2 size={14} /> Payout Completed
                  </div>
                  <p className="text-xs text-gray-500">Method: {deal.payout.method}</p>
                  <p className="text-xs text-gray-500 font-mono">Ref: {deal.payout.referenceNumber}</p>
                  <p className="text-xs text-gray-400">{formatDate(deal.payout.completedAt)}</p>
                </div>
              ) : ['COMPLETED','REFUNDED'].includes(deal.status) ? (
                showPayoutForm ? (
                  <div className="space-y-3">
                    <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)} className="input py-2 text-sm">
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="raast">Raast</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">EasyPaisa</option>
                    </select>
                    <input
                      value={payoutRef}
                      onChange={e => setPayoutRef(e.target.value)}
                      className="input py-2 text-sm font-mono"
                      placeholder="Transfer reference number"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowPayoutForm(false)} className="btn-ghost flex-1 text-sm py-2">Cancel</button>
                      <button
                        onClick={() => payoutMutation.mutate()}
                        disabled={!payoutRef || payoutMutation.isPending}
                        className="btn-primary flex-1 text-sm py-2"
                      >
                        {payoutMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                        Record
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-amber-600 mb-2">Payout not yet recorded for this deal</p>
                    <button onClick={() => setShowPayoutForm(true)} className="btn-primary w-full text-sm py-2">
                      <Wallet size={14} /> Record Payout
                    </button>
                  </div>
                )
              ) : (
                <p className="text-xs text-gray-400">Payout available after deal completes</p>
              )}
            </div>

            {/* Flag deal */}
            {!deal.flagged && (
              <div className="card card-body border-red-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Admin Actions</h3>
                <div className="space-y-2">
                  <input
                    value={flagReason}
                    onChange={e => setFlagReason(e.target.value)}
                    className="input py-2 text-sm"
                    placeholder="Reason for flagging…"
                  />
                  <button
                    onClick={() => flagMutation.mutate()}
                    disabled={!flagReason || flagMutation.isPending}
                    className="btn-danger w-full text-sm py-2"
                  >
                    <Flag size={14} /> Flag This Deal
                  </button>
                </div>
              </div>
            )}

            {/* Dispute link */}
            {deal.status === 'DISPUTED' && (
              <Link href="/admin/disputes" className="card card-body border-red-200 bg-red-50/30 flex items-center justify-between hover:bg-red-50 transition-colors group">
                <div>
                  <p className="text-sm font-semibold text-red-600">Open Dispute</p>
                  <p className="text-xs text-red-400">Requires admin verdict</p>
                </div>
                <Shield size={18} className="text-red-400 group-hover:text-red-600" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
