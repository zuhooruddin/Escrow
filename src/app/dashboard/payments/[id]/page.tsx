'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Shield, Smartphone, Building2, Upload, CheckCircle2, Info, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { formatPKR, cn } from '@/lib/utils';

type Method = 'jazzcash' | 'easypaisa' | 'bank_transfer';

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [method, setMethod] = useState<Method>('jazzcash');
  const [ibftFile, setIbftFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['deal-payment', id],
    queryFn: () => api.get(`/deals/${id}`).then(r => r.data.data.deal),
  });

  const { data: bankDetails } = useQuery({
    queryKey: ['bank-details'],
    queryFn: () => api.get('/payments/bank-details').then(r => r.data.data),
  });

  const jazzMutation = useMutation({
    mutationFn: () => api.post(`/payments/${id}/jazzcash`),
    onSuccess: (res) => {
      // Submit the form to JazzCash
      const { formData, actionUrl } = res.data.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = actionUrl;
      Object.entries(formData).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const easyMutation = useMutation({
    mutationFn: () => api.post(`/payments/${id}/easypaisa`),
    onSuccess: (res) => {
      const { params, actionUrl } = res.data.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = actionUrl;
      Object.entries(params).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = String(v);
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const ibftMutation = useMutation({
    mutationFn: async () => {
      if (!ibftFile) throw new Error('Please upload payment screenshot');
      setUploading(true);
      const { data: presign } = await api.post('/upload/presign', {
        filename: ibftFile.name, contentType: ibftFile.type, folder: 'ibft-screenshots',
      });
      await fetch(presign.data.uploadUrl, { method: 'PUT', body: ibftFile, headers: { 'Content-Type': ibftFile.type } });
      setUploading(false);
      return api.post(`/payments/${id}/ibft`, {
        screenshot: { key: presign.data.key, url: presign.data.publicUrl },
      });
    },
    onSuccess: () => {
      toast.success('Transfer submitted! Admin will verify within 24 hours.');
      router.push(`/dashboard/deals/${id}`);
    },
    onError: e => { setUploading(false); toast.error(getErrorMessage(e)); },
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-upwork-green" />
    </div>
  );

  if (!data) return null;

  const deal = data;

  return (
    <div className="max-w-xl animate-in">
      <Link href={`/dashboard/deals/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-6">
        <ArrowLeft size={16} /> Back to Deal
      </Link>

      <div className="mb-6">
        <h1 className="section-title">Fund Escrow</h1>
        <p className="section-sub">Deposit funds securely to start the deal</p>
      </div>

      {/* Amount Summary */}
      <div className="card card-body bg-upwork-green-l border-upwork-green/30 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-0.5">Escrow Amount</p>
            <p className="text-3xl font-semibold text-ink tracking-tight">{formatPKR(deal.amountInPaisa)}</p>
            <p className="text-xs text-gray-500 mt-1">For: {deal.title}</p>
          </div>
          <div className="w-14 h-14 bg-upwork-green rounded-full flex items-center justify-center">
            <Shield size={26} className="text-white" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <Shield size={12} className="text-upwork-green" />
          Funds held securely until you approve the seller's work
        </div>
      </div>

      {/* Method Selector */}
      <div className="card card-body mb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose Payment Method</p>
        <div className="space-y-2">
          {[
            { id: 'jazzcash' as Method, label: 'JazzCash', sub: 'Mobile wallet · Instant', icon: '📱', color: 'red' },
            { id: 'easypaisa' as Method, label: 'EasyPaisa', sub: 'Mobile wallet · Instant', icon: '💚', color: 'green' },
            { id: 'bank_transfer' as Method, label: 'Bank Transfer (IBFT)', sub: 'Manual verification · 24 hours', icon: '🏦', color: 'blue' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all',
                method === opt.id
                  ? 'border-upwork-green bg-upwork-green-l'
                  : 'border-gray-150 hover:border-gray-300 bg-white'
              )}
            >
              <span className="text-2xl">{opt.icon}</span>
              <div className="flex-1">
                <p className={cn('text-sm font-semibold', method === opt.id ? 'text-upwork-green' : 'text-ink')}>{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.sub}</p>
              </div>
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                method === opt.id ? 'border-upwork-green bg-upwork-green' : 'border-gray-300'
              )}>
                {method === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Method-specific content */}
      {method === 'jazzcash' && (
        <div className="card card-body mb-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              You'll be redirected to JazzCash to complete the payment. Make sure your JazzCash number matches your registered phone.
            </p>
          </div>
          <button onClick={() => jazzMutation.mutate()} disabled={jazzMutation.isPending} className="btn-primary w-full">
            {jazzMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Pay {formatPKR(deal.amountInPaisa)} via JazzCash
          </button>
        </div>
      )}

      {method === 'easypaisa' && (
        <div className="card card-body mb-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <Info size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              You'll be redirected to EasyPaisa's payment page. Enter your EasyPaisa PIN when prompted.
            </p>
          </div>
          <button onClick={() => easyMutation.mutate()} disabled={easyMutation.isPending} className="btn-primary w-full bg-green-600 hover:bg-green-700">
            {easyMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Pay {formatPKR(deal.amountInPaisa)} via EasyPaisa
          </button>
        </div>
      )}

      {method === 'bank_transfer' && bankDetails && (
        <div className="card card-body mb-4 space-y-4">
          <p className="text-sm font-semibold text-ink">Transfer to this account:</p>

          <div className="divide-y divide-gray-75 rounded-lg border border-gray-150 overflow-hidden">
            {[
              ['Bank Name', bankDetails.bankName],
              ['Account Title', bankDetails.accountTitle],
              ['Account Number', bankDetails.accountNumber],
              ['IBAN', bankDetails.iban],
              ['Amount', formatPKR(deal.amountInPaisa)],
              ['Reference', deal.dealNumber],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-ink font-mono text-right">{v}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 font-medium mb-1">⚠ Important</p>
            <p className="text-xs text-amber-600">Include your deal number <strong>{deal.dealNumber}</strong> in the transfer description. Upload screenshot after transfer.</p>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="label">Upload Transfer Screenshot <span className="text-danger">*</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
                ibftFile ? 'border-upwork-green bg-upwork-green-l' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={e => setIbftFile(e.target.files?.[0] || null)} />
              {ibftFile ? (
                <div className="flex items-center justify-center gap-2 text-upwork-green">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">{ibftFile.name}</span>
                </div>
              ) : (
                <div>
                  <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload screenshot</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG or PDF</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => ibftMutation.mutate()}
            disabled={!ibftFile || ibftMutation.isPending || uploading}
            className="btn-primary w-full"
          >
            {(ibftMutation.isPending || uploading) && <Loader2 size={16} className="animate-spin" />}
            Submit Payment for Verification
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <Shield size={12} className="text-upwork-green" />
        256-bit SSL encrypted · Powered by EscrowPK
      </div>
    </div>
  );
}
