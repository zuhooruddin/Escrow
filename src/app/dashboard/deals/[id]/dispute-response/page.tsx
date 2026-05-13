'use client';
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, X, CheckCircle2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { formatPKR, timeAgo, cn } from '@/lib/utils';

export default function DisputeResponsePage() {
  const { id } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [response, setResponse] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ key: string; publicUrl: string; originalName: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['dispute', id],
    queryFn: () => api.get(`/disputes/${id}`).then(r => r.data.data.deal),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);
    for (const file of files) {
      try {
        const { data: p } = await api.post('/upload/presign', { filename: file.name, contentType: file.type, folder: 'dispute-evidence' });
        await fetch(p.data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setUploadedFiles(prev => [...prev, { key: p.data.key, publicUrl: p.data.publicUrl, originalName: file.name }]);
      } catch { toast.error(`Failed to upload ${file.name}`); }
    }
    setUploading(false);
  };

  const respondMutation = useMutation({
    mutationFn: () => api.post(`/disputes/${id}/respond`, {
      response,
      evidence: uploadedFiles.map(f => ({ filename: f.originalName, r2Key: f.key, r2Url: f.publicUrl })),
    }),
    onSuccess: () => {
      toast.success('Response submitted. Admin team will review.');
      qc.invalidateQueries({ queryKey: ['deal', id] });
      router.push(`/dashboard/deals/${id}`);
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return (
    <div className="max-w-xl">
      <div className="h-8 w-32 bg-gray-100 rounded animate-pulse mb-6" />
      <div className="card card-body h-64 animate-pulse bg-gray-50" />
    </div>
  );

  const deal = data;
  if (!deal) return null;

  return (
    <div className="max-w-xl animate-in">
      <Link href={`/dashboard/deals/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-ink mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Deal
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
            <Shield size={16} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Respond to Dispute</h1>
        </div>
        <p className="text-gray-500 text-sm">Submit your side of the story and upload supporting evidence</p>
      </div>

      {/* Buyer's complaint */}
      <div className="card card-body border-red-200 bg-red-50/30 mb-5">
        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle size={11} /> Buyer's Complaint
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute?.buyerReason}</p>
        <p className="text-xs text-gray-400 mt-2">Raised {timeAgo(deal.disputedAt)} · Deal {deal.dealNumber} · {formatPKR(deal.amountInPaisa)}</p>
      </div>

      {/* Already responded */}
      {deal.dispute?.sellerResponse ? (
        <div className="card card-body border-upwork-green/30 bg-upwork-green-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-upwork-green" />
            <p className="text-sm font-semibold text-upwork-green">Response Already Submitted</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{deal.dispute.sellerResponse}</p>
          <p className="text-xs text-gray-400 mt-2">Submitted {timeAgo(deal.dispute.sellerRespondedAt)}</p>
        </div>
      ) : (
        <div className="card card-body space-y-5">
          <div>
            <label className="label">
              Your Response <span className="text-danger">*</span>
            </label>
            <textarea
              rows={6}
              value={response}
              onChange={e => setResponse(e.target.value)}
              className="input resize-none"
              placeholder={`Explain your side clearly:
• What work did you deliver?
• How does it meet the requirements?
• Why should the payment be released to you?
• Address the buyer's specific complaints.

Be factual and specific. Admin will review everything.`}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">Minimum 20 characters</span>
              <span className="text-xs text-gray-400">{response.length} chars</span>
            </div>
          </div>

          {/* Evidence upload */}
          <div>
            <label className="label">Upload Evidence (optional but recommended)</label>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-secondary w-full"
            >
              {uploading
                ? <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                : <><Upload size={15} /> Upload screenshots, reports, files</>
              }
            </button>
            <input ref={fileRef} type="file" multiple hidden onChange={handleUpload} />
            <p className="text-xs text-gray-400 mt-1.5">
              Screenshots, deliverable files, communication records, any proof
            </p>

            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-upwork-green-l rounded-lg">
                    <CheckCircle2 size={14} className="text-upwork-green flex-shrink-0" />
                    <span className="text-xs text-upwork-green flex-1 truncate font-medium">{f.originalName}</span>
                    <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-danger flex-shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>What happens next:</strong> Admin team will review both sides within 48 hours and issue a final verdict. Possible outcomes: full payment to you, partial refund to buyer, or full refund to buyer. Be honest and provide as much evidence as possible.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t border-gray-75">
            <Link href={`/dashboard/deals/${id}`} className="btn-ghost flex-1 justify-center">
              Cancel
            </Link>
            <button
              onClick={() => respondMutation.mutate()}
              disabled={response.length < 20 || respondMutation.isPending}
              className="btn-primary flex-1"
            >
              {respondMutation.isPending
                ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                : <><Shield size={15} /> Submit Response</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
