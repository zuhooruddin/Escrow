'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Download, Upload, Send, CheckCircle2, AlertTriangle, Clock,
  ExternalLink, FileText, Link as LinkIcon, MessageSquare,
  Shield, ChevronDown, ArrowLeft, Loader2, X, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  formatPKR, formatDate, formatDateFull, timeAgo,
  daysRemaining, hoursRemaining, getInitials, CATEGORY_LABELS, cn,
} from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

export default function DealDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview'|'messages'|'audit'>('overview');
  const [message, setMessage] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [links, setLinks] = useState<Array<{url:string;label:string}>>([]);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{key:string;publicUrl:string;originalName:string}>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.get(`/deals/${id}`).then(r => r.data.data),
  });

  const deal = data?.deal;
  const auditLog = data?.auditLog || [];
  const isBuyer = deal?.buyer?._id === user?._id;
  const isSeller = deal?.seller?._id === user?._id;
  const other = isBuyer ? deal?.seller : deal?.buyer;
  const autoHrs = deal?.autoApprovalDeadline ? hoursRemaining(deal.autoApprovalDeadline) : null;

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/accept`),
    onSuccess: () => { toast.success('Deal accepted! Buyer will be notified to fund.'); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const approveMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/approve`),
    onSuccess: () => { toast.success('Payment released to seller!'); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const deliverMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/deliver`, {
      note: deliveryNote, links,
      files: uploadedFiles.map(f => ({ r2Key: f.key, r2Url: f.publicUrl, originalName: f.originalName })),
    }),
    onSuccess: () => { toast.success('Work submitted! Buyer has been notified.'); setShowDeliveryForm(false); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const disputeMutation = useMutation({
    mutationFn: () => api.post(`/disputes/${id}/raise`, { reason: disputeReason }),
    onSuccess: () => { toast.success('Dispute raised. Funds frozen.'); setShowDisputeForm(false); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const messageMutation = useMutation({
    mutationFn: () => api.post(`/deals/${id}/message`, { content: message }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const { data: presign } = await api.post('/upload/presign', {
          filename: file.name, contentType: file.type, folder: 'deliverables',
        });
        await fetch(presign.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setUploadedFiles(prev => [...prev, { key: presign.data.key, publicUrl: presign.data.publicUrl, originalName: file.name }]);
        toast.success(`${file.name} uploaded`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
  };

  if (isLoading) return <DealSkeleton />;
  if (!deal) return <div className="text-center py-20 text-gray-500">Deal not found</div>;

  return (
    <div className="space-y-6 animate-in">

      {/* ── BACK ── */}
      <Link href="/dashboard/deals" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink transition-colors">
        <ArrowLeft size={16} /> Back to Deals
      </Link>

      {/* ── DEAL HEADER ── */}
      <div className="card card-body">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={deal.status} size="md" />
              <span className="text-xs text-gray-400 font-mono">{deal.dealNumber}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{CATEGORY_LABELS[deal.category]}</span>
            </div>
            <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">{deal.title}</h1>
            <p className="text-sm text-gray-500">
              {isBuyer ? `Seller: ` : `Buyer: `}
              <span className="font-medium text-ink">{other?.fullName}</span>
              {' · '}{other?.email}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-semibold text-ink tracking-tight">{formatPKR(deal.amountInPaisa)}</p>
            <p className="text-sm text-gray-400 mt-0.5">Created {timeAgo(deal.createdAt)}</p>
          </div>
        </div>

        {/* Auto-approval countdown */}
        {deal.status === 'DELIVERED' && autoHrs !== null && isBuyer && (
          <div className={cn(
            'mt-4 flex items-center gap-3 p-3 rounded-lg border text-sm font-medium',
            autoHrs < 24
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          )}>
            <Clock size={16} className="flex-shrink-0" />
            {autoHrs < 1
              ? 'Auto-approval happening very soon! Act now.'
              : autoHrs < 24
              ? `⚠ Auto-approves in ${autoHrs} hours — Review and act now!`
              : `Auto-approves in ${Math.ceil(autoHrs / 24)} days if no action is taken`
            }
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT: MAIN CONTENT ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex border-b border-gray-100 gap-6">
            {['overview','messages','audit'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  'pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
                  activeTab === tab
                    ? 'text-upwork-green border-upwork-green'
                    : 'text-gray-500 border-transparent hover:text-ink'
                )}
              >
                {tab === 'audit' ? 'Activity Log' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="card card-body">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Deal Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
              </div>

              {/* Deliverables */}
              {deal.deliverables?.submittedAt && (
                <div className="card card-body">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-upwork-green" />
                    Delivered Work
                  </h3>
                  {deal.deliverables.note && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{deal.deliverables.note}</p>
                  )}
                  {deal.deliverables.files?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Files</p>
                      {deal.deliverables.files.map((f: any, i: number) => (
                        <a key={i} href={f.r2Url} target="_blank" rel="noopener"
                          className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-150 rounded-lg hover:border-upwork-green/30 hover:bg-upwork-green-xl transition-all group">
                          <FileText size={16} className="text-upwork-green" />
                          <span className="text-sm text-ink flex-1 truncate">{f.originalName}</span>
                          <Download size={14} className="text-gray-400 group-hover:text-upwork-green" />
                        </a>
                      ))}
                    </div>
                  )}
                  {deal.deliverables.links?.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <p className="text-xs font-medium text-gray-500 uppercase">Links</p>
                      {deal.deliverables.links.map((l: any, i: number) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener"
                          className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-150 rounded-lg hover:border-blue-200 text-sm text-blue-600 hover:underline">
                          <LinkIcon size={14} /> {l.label || l.url}
                          <ExternalLink size={12} className="ml-auto" />
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">Submitted {formatDate(deal.deliverables.submittedAt)}</p>
                </div>
              )}

              {/* Dispute details */}
              {deal.dispute?.buyerReason && (
                <div className="card card-body border-red-200 bg-red-50/30">
                  <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} /> Dispute
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
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Admin Verdict</p>
                        <p className="text-sm font-semibold text-ink capitalize">{deal.dispute.verdict.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-gray-500 mt-1">{deal.dispute.verdictReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery form */}
              {showDeliveryForm && isSeller && deal.status === 'FUNDED' && (
                <div className="card card-body border-upwork-green/30">
                  <h3 className="text-base font-semibold text-ink mb-4">Submit Your Deliverables</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Delivery Note</label>
                      <textarea
                        rows={4}
                        value={deliveryNote}
                        onChange={e => setDeliveryNote(e.target.value)}
                        className="input resize-none"
                        placeholder="Describe what you've delivered, how to review it, and any important notes…"
                      />
                    </div>
                    {/* Files */}
                    <div>
                      <label className="label">Upload Files</label>
                      <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full">
                        <Upload size={16} /> Click to upload files
                      </button>
                      <input ref={fileRef} type="file" multiple hidden onChange={handleFileUpload} />
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 mt-2 text-sm text-upwork-green">
                          <CheckCircle2 size={14} /> {f.originalName}
                        </div>
                      ))}
                    </div>
                    {/* Links */}
                    <div>
                      <label className="label">Add Links (optional)</label>
                      {links.map((l, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input
                            className="input flex-1 py-2 text-sm"
                            placeholder="https://..."
                            value={l.url}
                            onChange={e => setLinks(prev => prev.map((x, j) => j===i ? {...x, url: e.target.value} : x))}
                          />
                          <button onClick={() => setLinks(prev => prev.filter((_,j) => j!==i))} className="p-2 text-gray-400 hover:text-danger">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => setLinks(l => [...l, {url:'',label:''}])} className="text-sm text-upwork-green hover:underline flex items-center gap-1">
                        <Plus size={14} /> Add link
                      </button>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowDeliveryForm(false)} className="btn-ghost flex-1">Cancel</button>
                      <button
                        onClick={() => deliverMutation.mutate()}
                        disabled={deliverMutation.isPending || (!deliveryNote && uploadedFiles.length === 0)}
                        className="btn-primary flex-1"
                      >
                        {deliverMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                        Mark as Delivered
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dispute form */}
              {showDisputeForm && isBuyer && deal.status === 'DELIVERED' && (
                <div className="card card-body border-red-200">
                  <h3 className="text-base font-semibold text-red-700 mb-1">Raise a Dispute</h3>
                  <p className="text-sm text-gray-500 mb-4">Explain clearly why you're unhappy. Funds will be frozen until admin resolves it.</p>
                  <textarea
                    rows={5}
                    value={disputeReason}
                    onChange={e => setDisputeReason(e.target.value)}
                    className="input resize-none mb-4"
                    placeholder="Describe the problem in detail. What was expected vs what was delivered? Include specific examples…"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowDisputeForm(false)} className="btn-ghost flex-1">Cancel</button>
                    <button
                      onClick={() => disputeMutation.mutate()}
                      disabled={disputeMutation.isPending || disputeReason.length < 20}
                      className="btn-danger flex-1"
                    >
                      {disputeMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                      Submit Dispute
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="card card-body">
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto scrollbar-thin">
                {deal.messages?.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the conversation.</p>
                )}
                {deal.messages?.map((msg: any, i: number) => {
                  const isMe = msg.sender._id === user?._id;
                  return (
                    <div key={i} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
                      <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                        <span>{getInitials(msg.sender.fullName || 'U')}</span>
                      </div>
                      <div className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                        isMe ? 'bg-upwork-green text-white rounded-tr-sm' : 'bg-gray-100 text-ink rounded-tl-sm'
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn('text-xs mt-1 opacity-70')}>{timeAgo(msg.sentAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!['COMPLETED','REFUNDED','CANCELLED'].includes(deal.status) && (
                <div className="flex gap-3 border-t border-gray-75 pt-4">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && message.trim() && messageMutation.mutate()}
                    className="input flex-1 py-2 text-sm"
                    placeholder="Type a message…"
                  />
                  <button
                    onClick={() => messageMutation.mutate()}
                    disabled={!message.trim() || messageMutation.isPending}
                    className="btn-primary px-4 py-2"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AUDIT LOG TAB */}
          {activeTab === 'audit' && (
            <div className="card card-body">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Complete Activity Log</h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {auditLog.map((log: any, i: number) => (
                    <div key={i} className="flex gap-4 pl-8 relative">
                      <div className="absolute left-0 w-6 h-6 rounded-full bg-upwork-green-l border-2 border-white flex items-center justify-center top-0">
                        <div className="w-2 h-2 rounded-full bg-upwork-green" />
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm text-ink">{log.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{formatDateFull(log.timestamp)}</span>
                          {log.triggeredBy && (
                            <span className="text-xs text-gray-400">· by {log.triggeredBy.fullName || 'System'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: ACTIONS ── */}
        <div className="space-y-4">

          {/* Timeline */}
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Deal Timeline</h3>
            <div className="space-y-3">
              {[
                { label: 'Created', date: deal.createdAt, done: true },
                { label: 'Seller Accepted', date: deal.sellerAcceptedAt, done: !!deal.sellerAcceptedAt },
                { label: 'Funded', date: deal.fundedAt, done: !!deal.fundedAt },
                { label: 'Work Delivered', date: deal.deliveredAt, done: !!deal.deliveredAt },
                { label: 'Completed', date: deal.completedAt, done: !!deal.completedAt },
              ].map(({ label, date, done }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                    done ? 'bg-upwork-green' : 'bg-gray-100'
                  )}>
                    {done && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-xs font-medium', done ? 'text-ink' : 'text-gray-400')}>{label}</p>
                    {date && <p className="text-xs text-gray-400">{formatDate(date)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Deal Amount</span>
                <span className="font-medium">{formatPKR(deal.amountInPaisa)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Platform Fee (2%)</span>
                <span>− {formatPKR(deal.platformFeeInPaisa)}</span>
              </div>
              <div className="flex justify-between font-semibold text-ink border-t border-gray-75 pt-2">
                <span>Seller Receives</span>
                <span className="text-upwork-green">{formatPKR(deal.sellerPayoutInPaisa)}</span>
              </div>
            </div>
          </div>

          {/* ─── ACTION BUTTONS ─── */}
          <div className="space-y-3">

            {/* Seller: Accept deal */}
            {isSeller && deal.status === 'PENDING' && !deal.sellerAcceptedAt && (
              <div className="card card-body">
                <p className="text-sm text-gray-600 mb-3">Review the deal details and accept to begin.</p>
                <button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending} className="btn-primary w-full">
                  {acceptMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Accept Deal
                </button>
              </div>
            )}

            {/* Buyer: Fund deal */}
            {isBuyer && deal.status === 'PENDING' && deal.sellerAcceptedAt && (
              <div className="card card-body border-upwork-green/30 bg-upwork-green-xl">
                <p className="text-sm text-gray-700 font-medium mb-1">Seller has accepted!</p>
                <p className="text-xs text-gray-500 mb-3">Deposit {formatPKR(deal.amountInPaisa)} to begin work.</p>
                <Link href={`/dashboard/payments/${id}`} className="btn-primary w-full justify-center">
                  Deposit Escrow Funds →
                </Link>
              </div>
            )}

            {/* Seller: Submit deliverables */}
            {isSeller && deal.status === 'FUNDED' && !showDeliveryForm && (
              <button onClick={() => setShowDeliveryForm(true)} className="btn-primary w-full">
                <Upload size={16} /> Submit Deliverables
              </button>
            )}

            {/* Buyer: Approve or Dispute */}
            {isBuyer && deal.status === 'DELIVERED' && (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (confirm('Approve this work and release payment to the seller?')) approveMutation.mutate();
                  }}
                  disabled={approveMutation.isPending}
                  className="btn-primary w-full bg-upwork-green"
                >
                  {approveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Approve & Release Payment
                </button>
                {!showDisputeForm && (
                  <button onClick={() => setShowDisputeForm(true)} className="btn-danger w-full">
                    <AlertTriangle size={16} /> Raise a Dispute
                  </button>
                )}
              </div>
            )}

            {/* Disputed - seller respond */}
            {isSeller && deal.status === 'DISPUTED' && !deal.dispute?.sellerResponse && (
              <Link href={`/dashboard/deals/${id}/dispute-response`} className="btn-secondary w-full justify-center">
                <Shield size={16} /> Respond to Dispute
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-28 bg-gray-100 rounded" />
      <div className="card card-body space-y-3">
        <div className="h-7 w-3/4 bg-gray-100 rounded" />
        <div className="h-5 w-1/2 bg-gray-75 rounded" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card card-body h-64 bg-gray-50" />
        <div className="card card-body h-64 bg-gray-50" />
      </div>
    </div>
  );
}
