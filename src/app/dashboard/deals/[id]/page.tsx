'use client';
import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Download, Upload, Send, CheckCircle2, AlertTriangle, Clock,
  ExternalLink, FileText, Link as LinkIcon,
  Shield, ArrowLeft, Loader2, X, Plus, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import {
  formatPKR, formatDate, formatDateFull, timeAgo,
  daysRemaining, hoursRemaining, getInitials, CATEGORY_LABELS, cn,
} from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

// ── responsive styles (defined once, outside component) ──────────────────────
const RESPONSIVE_CSS = `
  .dd-body { padding: 16px; flex-direction: column !important; }
  .dd-side { width: 100% !important; flex-shrink: unset !important; }
  .dd-hero-top { flex-direction: column !important; gap: 10px !important; }
  .dd-amount { text-align: left !important; }
  .dd-hero-pad { padding: 18px 16px !important; }
  .dd-ms-pad { padding: 14px 16px 18px !important; }
  .dd-tabs { padding: 0 16px !important; }
  .dd-tab-content { padding: 18px 16px !important; }
  .dd-ms-label { font-size: 9px !important; }
  @media (min-width: 768px) {
    .dd-body { padding: 28px 32px; flex-direction: row !important; }
    .dd-side { width: 308px !important; flex-shrink: 0 !important; }
    .dd-hero-top { flex-direction: row !important; gap: 0 !important; }
    .dd-amount { text-align: right !important; }
    .dd-hero-pad { padding: 24px 28px !important; }
    .dd-ms-pad { padding: 16px 28px 20px !important; }
    .dd-tabs { padding: 0 28px !important; }
    .dd-tab-content { padding: 24px 28px !important; }
    .dd-ms-label { font-size: 11px !important; }
  }
`;

// ── design tokens ─────────────────────────────────────────────────────────────
const T = {
  teal:     '#0fa88a',
  tealDk:   '#0a7d67',
  tealLt:   '#e6f7f4',
  ink:      '#0d1117',
  inkMid:   '#3a4150',
  inkSoft:  '#6b7585',
  inkGhost: '#a8b3c0',
  surface:  '#f5f7fa',
  border:   'rgba(0,0,0,0.08)',
  amber:    '#f59e0b',
  amberLt:  '#fef3c7',
  red:      '#ef4444',
};

const card: React.CSSProperties = {
  background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden',
};

export default function DealDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'audit'>('overview');
  const [message, setMessage] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [links, setLinks] = useState<Array<{ url: string; label: string }>>([]);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; publicUrl: string; originalName: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [payMethod, setPayMethod] = useState<'jazzcash' | 'easypaisa' | 'bank_transfer'>('jazzcash');
  const [ibftFile, setIbftFile] = useState<File | null>(null);
  const [ibftUploading, setIbftUploading] = useState(false);
  const ibftRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => api.get(`/deals/${id}`).then(r => r.data.data),
    staleTime: 30 * 1000,
  });

  const deal = data?.deal;
  const auditLog = data?.auditLog || [];
  const isBuyer = deal?.buyer?._id === user?._id;
  const isSeller = deal?.seller?._id === user?._id;
  const autoHrs = deal?.autoApprovalDeadline ? hoursRemaining(deal.autoApprovalDeadline) : null;

  const acceptMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/accept`),
    onSuccess: () => { toast.success('Deal accepted!'); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const approveMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/approve`),
    onSuccess: () => { toast.success('Payment released!'); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const deliverMutation = useMutation({
    mutationFn: () => api.patch(`/deals/${id}/deliver`, {
      note: deliveryNote, links,
      files: uploadedFiles.map(f => ({ r2Key: f.key, r2Url: f.publicUrl, originalName: f.originalName })),
    }),
    onSuccess: () => { toast.success('Work submitted!'); setShowDeliveryForm(false); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const disputeMutation = useMutation({
    mutationFn: () => api.post(`/disputes/${id}/raise`, { reason: disputeReason }),
    onSuccess: () => { toast.success('Dispute raised.'); setShowDisputeForm(false); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const messageMutation = useMutation({
    mutationFn: () => api.post(`/deals/${id}/message`, { content: message }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const { data: bankDetails } = useQuery({
    queryKey: ['bank-details'],
    queryFn: () => api.get('/payments/bank-details').then(r => r.data.data),
    enabled: isBuyer && deal?.status === 'PENDING' && !!deal?.sellerAcceptedAt && payMethod === 'bank_transfer',
    staleTime: 10 * 60 * 1000,
  });
  const jazzMutation = useMutation({
    mutationFn: () => api.post(`/payments/${id}/jazzcash`),
    onSuccess: (res) => {
      const { formData, actionUrl } = res.data.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST'; form.action = actionUrl;
      Object.entries(formData).forEach(([k, v]) => {
        const inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = k; inp.value = String(v);
        form.appendChild(inp);
      });
      document.body.appendChild(form); form.submit();
    },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const easyMutation = useMutation({
    mutationFn: () => api.post(`/payments/${id}/easypaisa`),
    onSuccess: (res) => {
      const { params, actionUrl } = res.data.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST'; form.action = actionUrl;
      Object.entries(params).forEach(([k, v]) => {
        const inp = document.createElement('input');
        inp.type = 'hidden'; inp.name = k; inp.value = String(v);
        form.appendChild(inp);
      });
      document.body.appendChild(form); form.submit();
    },
    onError: e => toast.error(getErrorMessage(e)),
  });
  const ibftMutation = useMutation({
    mutationFn: async () => {
      if (!ibftFile) throw new Error('Upload a screenshot first');
      setIbftUploading(true);
      const { data: presign } = await api.post('/upload/presign', {
        filename: ibftFile.name, contentType: ibftFile.type, folder: 'ibft-screenshots',
      });
      await fetch(presign.data.uploadUrl, { method: 'PUT', body: ibftFile, headers: { 'Content-Type': ibftFile.type } });
      setIbftUploading(false);
      return api.post(`/payments/${id}/ibft`, { screenshot: { key: presign.data.key, url: presign.data.publicUrl } });
    },
    onSuccess: () => { toast.success('Submitted! Admin will verify within 24 hours.'); setIbftFile(null); qc.invalidateQueries({ queryKey: ['deal', id] }); },
    onError: e => { setIbftUploading(false); toast.error(getErrorMessage(e)); },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    for (const file of Array.from(e.target.files || [])) {
      try {
        const { data: presign } = await api.post('/upload/presign', { filename: file.name, contentType: file.type, folder: 'deliverables' });
        await fetch(presign.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setUploadedFiles(prev => [...prev, { key: presign.data.key, publicUrl: presign.data.publicUrl, originalName: file.name }]);
        toast.success(`${file.name} uploaded`);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
  };

  if (isLoading) return <DealSkeleton />;
  if (!deal) return <div style={{ textAlign: 'center', padding: '80px 0', color: T.inkSoft }}>Deal not found</div>;

  const milestones = [
    { label: 'Created',   done: true,                  active: false },
    { label: 'Accepted',  done: !!deal.sellerAcceptedAt, active: !deal.sellerAcceptedAt },
    { label: 'Funded',    done: !!deal.fundedAt,          active: !!deal.sellerAcceptedAt && !deal.fundedAt },
    { label: 'Delivered', done: !!deal.deliveredAt,       active: !!deal.fundedAt && !deal.deliveredAt },
    { label: 'Completed', done: !!deal.completedAt,       active: !!deal.deliveredAt && !deal.completedAt },
  ];

  const tlItems = [
    { label: 'Deal Created',             time: deal.createdAt,        done: true,                    active: false },
    { label: 'Awaiting Acceptance',      time: null,                  done: !!deal.sellerAcceptedAt, active: !deal.sellerAcceptedAt },
    { label: 'Funds Released to Escrow', time: deal.fundedAt,         done: !!deal.fundedAt,         active: !!deal.sellerAcceptedAt && !deal.fundedAt },
    { label: 'Work Delivered',           time: deal.deliveredAt,      done: !!deal.deliveredAt,      active: !!deal.fundedAt && !deal.deliveredAt },
    { label: 'Deal Completed',           time: deal.completedAt,      done: !!deal.completedAt,      active: !!deal.deliveredAt && !deal.completedAt },
  ];

  const btnTeal: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '13px 16px', background: T.teal, color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px',
  };

  return (
    <div style={{ background: T.surface, minHeight: '100vh', margin: '-24px -32px', padding: '0 0 48px' }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* ── PAGE BODY ── */}
      <div className="dd-body" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ════ MAIN COL ════ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* DEAL HERO CARD */}
          <div style={card}>
            <div className="dd-hero-pad" style={{ padding: '24px 28px' }}>
              <div className="dd-hero-top" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>

                {/* left */}
                <div style={{ flex: 1 }}>
                  {/* status row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 8px', borderRadius: 20, background: T.amberLt, color: '#92400e', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.amber, display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      <StatusBadge status={deal.status} size="sm" />
                    </div>
                    <span style={{ fontSize: 12, color: T.inkGhost }}>Created {timeAgo(deal.createdAt)}</span>
                  </div>

                  {/* title */}
                  <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: T.ink, marginBottom: 10 }}>{deal.title}</h1>

                  {/* meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: T.inkSoft }}>
                      <Shield size={13} color={T.inkSoft} />
                      Buyer: <strong style={{ color: T.ink, fontWeight: 500, marginLeft: 3 }}>{deal.buyer?.fullName}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: T.inkSoft }}>
                      <Shield size={13} color={T.inkSoft} />
                      {deal.seller?.email || deal.sellerEmail || 'Pending registration'}
                    </div>
                    {deal.deadline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: T.inkSoft }}>
                        <Clock size={13} color={T.inkSoft} />
                        Deadline: <strong style={{ color: T.ink, fontWeight: 500, marginLeft: 3 }}>{formatDateFull(deal.deadline)}</strong>
                        {daysRemaining(deal.deadline) > 0
                          ? <span style={{ background: '#fef0f0', color: '#b91c1c', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, marginLeft: 6 }}>{daysRemaining(deal.deadline)} days left</span>
                          : <span style={{ background: '#fef0f0', color: '#b91c1c', padding: '2px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, marginLeft: 6 }}>Overdue</span>
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* amount */}
                <div className="dd-amount" style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Deal Value</div>
                  <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-1px', color: T.ink }}>
                    <span style={{ fontSize: 16, fontWeight: 500, color: T.inkSoft }}>Rs. </span>
                    {(deal.amountInPaisa / 100).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* auto-approval banner */}
              {deal.status === 'DELIVERED' && autoHrs !== null && isBuyer && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: autoHrs < 24 ? '#fef2f2' : '#fffbeb', border: `1px solid ${autoHrs < 24 ? '#fca5a5' : '#fcd34d'}`, fontSize: 13, fontWeight: 500, color: autoHrs < 24 ? '#b91c1c' : '#92400e' }}>
                  <Clock size={14} />
                  {autoHrs < 1 ? 'Auto-approval happening very soon!' : autoHrs < 24 ? `⚠ Auto-approves in ${autoHrs} hours` : `Auto-approves in ${Math.ceil(autoHrs / 24)} days`}
                </div>
              )}
            </div>

            {/* MILESTONE BAR */}
            <div className="dd-ms-pad" style={{ background: '#fafbfc', padding: '16px 28px 20px', borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Deal Progress</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {milestones.map((ms, i) => (
                  <div key={ms.label} style={{ display: 'flex', alignItems: 'center', flex: i < milestones.length - 1 ? 1 : 'none' }}>
                    {/* node */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: ms.done ? T.teal : '#fff',
                        border: `2px solid ${ms.done ? T.teal : ms.active ? T.teal : T.border}`,
                        boxShadow: ms.active ? `0 0 0 4px rgba(15,168,138,0.12)` : 'none',
                      }}>
                        {ms.done
                          ? <CheckCircle2 size={13} color="#fff" />
                          : ms.active
                            ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal }} />
                            : <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.border }} />
                        }
                      </div>
                      <div className="dd-ms-label" style={{ fontSize: 11, fontWeight: 500, color: ms.done ? T.teal : ms.active ? T.ink : T.inkGhost, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {ms.label}
                      </div>
                    </div>
                    {/* connector */}
                    {i < milestones.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: ms.done ? T.teal : T.border, marginBottom: 20, marginLeft: -1, marginRight: -1 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* TABS */}
            <div className="dd-tabs" style={{ borderTop: `1px solid ${T.border}`, display: 'flex', padding: '0 28px', overflowX: 'auto' }}>
              {([
                { key: 'overview', label: 'Overview' },
                { key: 'messages', label: 'Messages' },
                { key: 'audit', label: 'Activity Log' },
              ] as const).map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '14px 4px', marginRight: 24, fontSize: 13.5,
                  fontWeight: activeTab === tab.key ? 600 : 500,
                  color: activeTab === tab.key ? T.teal : T.inkSoft,
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? T.teal : 'transparent'}`,
                  background: 'none', cursor: 'pointer', fontFamily: 'inherit', position: 'relative', top: 1,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="dd-tab-content" style={{ padding: '24px 28px', borderTop: `1px solid ${T.border}` }}>

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Deal Description</div>
                    <p style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.7 }}>{deal.description}</p>
                  </div>

                  {deal.deliverables?.submittedAt && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={12} color={T.teal} /> Delivered Work
                      </div>
                      {deal.deliverables.note && <p style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.7, marginBottom: 12 }}>{deal.deliverables.note}</p>}
                      {deal.deliverables.files?.map((f: any, i: number) => (
                        <a key={i} href={f.r2Url} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.surface, borderRadius: 8, marginBottom: 6, textDecoration: 'none', color: T.ink }}>
                          <FileText size={15} color={T.teal} />
                          <span style={{ fontSize: 13, flex: 1 }}>{f.originalName}</span>
                          <Download size={13} color={T.inkGhost} />
                        </a>
                      ))}
                      {deal.deliverables.links?.map((l: any, i: number) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.surface, borderRadius: 8, marginBottom: 6, textDecoration: 'none', color: '#2563eb', fontSize: 13 }}>
                          <LinkIcon size={13} /> {l.label || l.url} <ExternalLink size={11} style={{ marginLeft: 'auto' }} />
                        </a>
                      ))}
                    </div>
                  )}

                  {deal.dispute?.buyerReason && (
                    <div style={{ background: '#fff5f5', border: `1px solid #fecaca`, borderRadius: 10, padding: '16px 18px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={12} /> Dispute
                      </div>
                      <p style={{ fontSize: 13, color: T.inkMid, marginBottom: deal.dispute.sellerResponse ? 12 : 0 }}>{deal.dispute.buyerReason}</p>
                      {deal.dispute.sellerResponse && <p style={{ fontSize: 13, color: T.inkMid }}><strong>Seller:</strong> {deal.dispute.sellerResponse}</p>}
                      {deal.dispute.verdict && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff', borderRadius: 8, border: `1px solid ${T.border}` }}>
                          <div style={{ fontSize: 11, color: T.inkGhost, marginBottom: 4 }}>Admin Verdict</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, textTransform: 'capitalize' }}>{deal.dispute.verdict.replace(/_/g, ' ')}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {showDeliveryForm && isSeller && deal.status === 'FUNDED' && (
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: '20px 22px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 16 }}>Submit Deliverables</div>
                      <textarea rows={4} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="input resize-none" placeholder="Describe what you've delivered…" style={{ marginBottom: 12 }} />
                      <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full" style={{ marginBottom: 8 }}>
                        <Upload size={15} /> Upload Files
                      </button>
                      <input ref={fileRef} type="file" multiple hidden onChange={handleFileUpload} />
                      {uploadedFiles.map((f, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.teal, marginBottom: 4 }}><CheckCircle2 size={13} />{f.originalName}</div>)}
                      {links.map((l, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input className="input flex-1 py-2 text-sm" placeholder="https://…" value={l.url} onChange={e => setLinks(prev => prev.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                          <button onClick={() => setLinks(prev => prev.filter((_, j) => j !== i))} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: T.inkGhost }}><X size={15} /></button>
                        </div>
                      ))}
                      <button onClick={() => setLinks(l => [...l, { url: '', label: '' }])} style={{ fontSize: 13, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                        <Plus size={13} /> Add link
                      </button>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowDeliveryForm(false)} className="btn-ghost flex-1">Cancel</button>
                        <button onClick={() => deliverMutation.mutate()} disabled={deliverMutation.isPending || (!deliveryNote && uploadedFiles.length === 0)} style={{ ...btnTeal, flex: 1 }}>
                          {deliverMutation.isPending && <Loader2 size={15} className="animate-spin" />} Mark as Delivered
                        </button>
                      </div>
                    </div>
                  )}

                  {showDisputeForm && isBuyer && deal.status === 'DELIVERED' && (
                    <div style={{ border: `1px solid #fecaca`, borderRadius: 12, padding: '20px 22px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.red, marginBottom: 8 }}>Raise a Dispute</div>
                      <p style={{ fontSize: 13, color: T.inkSoft, marginBottom: 12 }}>Funds will be frozen until admin resolves it.</p>
                      <textarea rows={5} value={disputeReason} onChange={e => setDisputeReason(e.target.value)} className="input resize-none" placeholder="Describe the problem…" style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowDisputeForm(false)} className="btn-ghost flex-1">Cancel</button>
                        <button onClick={() => disputeMutation.mutate()} disabled={disputeMutation.isPending || disputeReason.length < 20} className="btn-danger flex-1">
                          {disputeMutation.isPending && <Loader2 size={15} className="animate-spin" />} Submit Dispute
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MESSAGES */}
              {activeTab === 'messages' && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 380, overflowY: 'auto', marginBottom: 16 }}>
                    {deal.messages?.length === 0 && <p style={{ textAlign: 'center', color: T.inkGhost, fontSize: 13, padding: '32px 0' }}>No messages yet.</p>}
                    {deal.messages?.map((msg: any, i: number) => {
                      const isMe = msg.sender._id === user?._id;
                      return (
                        <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMe ? T.teal : T.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {getInitials(msg.sender.fullName || 'U')}
                          </div>
                          <div style={{ maxWidth: '72%', borderRadius: 16, padding: '10px 14px', background: isMe ? T.teal : '#f1f3f5', color: isMe ? '#fff' : T.ink, borderTopRightRadius: isMe ? 4 : 16, borderTopLeftRadius: isMe ? 16 : 4, fontSize: 13 }}>
                            <p>{msg.content}</p>
                            <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{timeAgo(msg.sentAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(deal.status) && (
                    <div style={{ display: 'flex', gap: 10, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                      <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && message.trim() && messageMutation.mutate()} className="input flex-1 py-2 text-sm" placeholder="Type a message…" />
                      <button onClick={() => messageMutation.mutate()} disabled={!message.trim() || messageMutation.isPending} style={{ width: 40, height: 40, borderRadius: 10, background: T.teal, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Send size={15} color="#fff" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIT LOG */}
              {activeTab === 'audit' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Complete Activity Log</div>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 11, top: 0, bottom: 0, width: 2, background: T.border }} />
                    {auditLog.map((log: any, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 14, paddingLeft: 32, paddingBottom: 18, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 2, width: 22, height: 22, borderRadius: '50%', background: T.tealLt, border: `2px solid #fff`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, color: T.ink, fontWeight: 500 }}>{log.action}</p>
                          <p style={{ fontSize: 11, color: T.inkGhost, marginTop: 2, fontFamily: 'monospace' }}>
                            {formatDateFull(log.timestamp)}{log.triggeredBy ? ` · ${log.triggeredBy.fullName || 'System'}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ SIDE COL ════ */}
        <div className="dd-side" style={{ width: 308, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ACTIVITY TIMELINE */}
          <div style={{ ...card, padding: '22px 22px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Activity Timeline</div>
            <div>
              {tlItems.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', gap: 14 }}>
                  {/* dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: item.done ? T.teal : '#fff',
                      border: `2px solid ${item.done ? T.teal : item.active ? T.teal : T.border}`,
                    }}>
                      {item.done
                        ? <CheckCircle2 size={10} color="#fff" />
                        : item.active
                          ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.teal }} />
                          : <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.border }} />
                      }
                    </div>
                    {i < tlItems.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 22, background: item.done ? T.teal : T.border, margin: '3px 0' }} />
                    )}
                  </div>
                  {/* text */}
                  <div style={{ paddingBottom: i < tlItems.length - 1 ? 18 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: item.done ? T.ink : item.active ? T.teal : T.inkGhost }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: T.inkGhost, marginTop: 2, fontFamily: 'monospace' }}>
                      {item.time ? formatDate(item.time) : (item.active ? 'In progress…' : '—')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT BREAKDOWN */}
          <div style={{ ...card, padding: '22px 22px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Payment Breakdown</div>
            {[
              { label: 'Deal Amount', value: formatPKR(deal.amountInPaisa), neg: false },
              { label: 'Platform Fee (2%)', value: `− ${formatPKR(deal.platformFeeInPaisa)}`, neg: true },
              { label: 'Processing Fee', value: '— Rs. 0', neg: false },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px dashed ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.inkSoft }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: row.neg ? T.red : T.ink, fontFamily: 'monospace' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: '14px 16px', background: T.tealLt, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.tealDk }}>
                {isBuyer ? 'You Pay' : 'You Receive'}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: T.tealDk, fontFamily: 'monospace' }}>
                {formatPKR(isBuyer ? deal.amountInPaisa : deal.sellerPayoutInPaisa)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: T.surface, borderRadius: 8, border: `1px solid ${T.border}`, marginTop: 12 }}>
              <Shield size={13} color={T.teal} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.inkSoft }}>Funds held in <strong style={{ color: T.teal }}>secure escrow</strong> until approved</span>
            </div>
          </div>

          {/* CTA CARD */}
          <div style={{ ...card, padding: '20px 22px' }}>

            {/* Seller: accept */}
            {isSeller && deal.status === 'PENDING' && !deal.sellerAcceptedAt && (
              <>
                <button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending} style={btnTeal}>
                  {acceptMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} color="#fff" />}
                  Accept Deal
                </button>
                <button onClick={() => {}} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 16px', background: 'transparent', color: T.inkSoft, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
                  Decline Deal
                </button>
                <p style={{ fontSize: 11, color: T.inkGhost, textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  By accepting, you agree to deliver by <strong>{deal.deadline ? formatDateFull(deal.deadline) : '—'}</strong>. Funds release on buyer approval.
                </p>
              </>
            )}

            {/* Buyer: fund — inline payment */}
            {isBuyer && deal.status === 'PENDING' && deal.sellerAcceptedAt && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.inkGhost, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Choose Payment Method</div>
                {[
                  { id: 'jazzcash' as const, label: 'JazzCash', sub: 'Mobile wallet · Instant', icon: '📱' },
                  { id: 'easypaisa' as const, label: 'EasyPaisa', sub: 'Mobile wallet · Instant', icon: '💚' },
                  { id: 'bank_transfer' as const, label: 'Bank Transfer (IBFT)', sub: 'Manual · 24h', icon: '🏦' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setPayMethod(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `2px solid ${payMethod === opt.id ? T.teal : T.border}`, background: payMethod === opt.id ? T.tealLt : '#fff', cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: payMethod === opt.id ? T.tealDk : T.ink }}>{opt.label}</div>
                      <div style={{ fontSize: 11, color: T.inkGhost }}>{opt.sub}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: 16, height: 16, borderRadius: '50%', border: `2px solid ${payMethod === opt.id ? T.teal : T.border}`, background: payMethod === opt.id ? T.teal : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {payMethod === opt.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </button>
                ))}

                {payMethod === 'jazzcash' && (
                  <button onClick={() => jazzMutation.mutate()} disabled={jazzMutation.isPending} style={btnTeal}>
                    {jazzMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                    Pay {formatPKR(deal.amountInPaisa)} via JazzCash
                  </button>
                )}
                {payMethod === 'easypaisa' && (
                  <button onClick={() => easyMutation.mutate()} disabled={easyMutation.isPending} style={{ ...btnTeal, background: '#16a34a' }}>
                    {easyMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                    Pay {formatPKR(deal.amountInPaisa)} via EasyPaisa
                  </button>
                )}
                {payMethod === 'bank_transfer' && bankDetails && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, overflow: 'hidden' }}>
                      {[['Bank', bankDetails.bankName], ['Account', bankDetails.accountNumber], ['Ref', deal.dealNumber], ['Amount', formatPKR(deal.amountInPaisa)]].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px dashed ${T.border}`, fontSize: 12 }}>
                          <span style={{ color: T.inkSoft }}>{k}</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 500, color: T.ink }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div onClick={() => ibftRef.current?.click()} style={{ border: `2px dashed ${ibftFile ? T.teal : T.border}`, borderRadius: 10, padding: '12px 0', textAlign: 'center', cursor: 'pointer', background: ibftFile ? T.tealLt : '#fff' }}>
                      <input ref={ibftRef} type="file" accept="image/*,application/pdf" hidden onChange={e => setIbftFile(e.target.files?.[0] || null)} />
                      {ibftFile
                        ? <span style={{ fontSize: 12, color: T.teal, fontWeight: 500 }}>✓ {ibftFile.name}</span>
                        : <><Upload size={16} color={T.inkGhost} style={{ margin: '0 auto 4px' }} /><p style={{ fontSize: 12, color: T.inkGhost }}>Upload screenshot</p></>
                      }
                    </div>
                    <button onClick={() => ibftMutation.mutate()} disabled={!ibftFile || ibftMutation.isPending || ibftUploading} style={btnTeal}>
                      {(ibftMutation.isPending || ibftUploading) && <Loader2 size={15} className="animate-spin" />}
                      Submit for Verification
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seller: deliver */}
            {isSeller && deal.status === 'FUNDED' && !showDeliveryForm && (
              <button onClick={() => { setShowDeliveryForm(true); setActiveTab('overview'); }} style={btnTeal}>
                <Upload size={15} color="#fff" /> Submit Deliverables
              </button>
            )}

            {/* Buyer: approve / dispute */}
            {isBuyer && deal.status === 'DELIVERED' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { if (confirm('Release payment to seller?')) approveMutation.mutate(); }} disabled={approveMutation.isPending} style={btnTeal}>
                  {approveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} color="#fff" />}
                  Approve & Release Payment
                </button>
                {!showDisputeForm && (
                  <button onClick={() => { setShowDisputeForm(true); setActiveTab('overview'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 16px', background: 'transparent', color: T.red, border: `1px solid #fca5a5`, borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <AlertTriangle size={14} /> Raise a Dispute
                  </button>
                )}
              </div>
            )}

            {/* Disputed - seller respond */}
            {isSeller && deal.status === 'DISPUTED' && !deal.dispute?.sellerResponse && (
              <Link href={`/dashboard/deals/${id}/dispute-response`} style={{ ...btnTeal, textDecoration: 'none' }}>
                <Shield size={15} color="#fff" /> Respond to Dispute
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
    <div style={{ background: T.surface, minHeight: '100vh', margin: '-24px -32px', padding: '60px 32px' }}>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, height: 500, background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, animation: 'pulse 2s infinite' }} />
        <div style={{ width: 308, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ height: 240, background: '#fff', borderRadius: 14, border: `1px solid ${T.border}` }} />
          <div style={{ height: 160, background: '#fff', borderRadius: 14, border: `1px solid ${T.border}` }} />
          <div style={{ height: 120, background: '#fff', borderRadius: 14, border: `1px solid ${T.border}` }} />
        </div>
      </div>
    </div>
  );
}
