'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, Loader2, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate, timeAgo } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';

export default function AdminIBFTPendingPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-ibft-pending'],
    queryFn: () => api.get('/admin/ibft-pending').then(r => r.data.data),
    refetchInterval: 30000,
    enabled: adminApiEnabled,
  });

  const confirmMutation = useMutation({
    mutationFn: (dealId: string) => api.patch(`/payments/${dealId}/ibft/confirm`),
    onSuccess: () => {
      toast.success('IBFT payment confirmed! Deal is now FUNDED.');
      qc.invalidateQueries({ queryKey: ['admin-ibft-pending'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const deals = data?.deals || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="section-title flex items-center gap-2">
            <Building2 size={24} className="text-amber-500" />
            Pending IBFT Verifications
          </h1>
          <p className="section-sub">Manually verify bank transfer payments and fund deals</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card card-body h-28 animate-pulse bg-gray-50" />)}
          </div>
        ) : !deals.length ? (
          <div className="card card-body flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle2 size={40} className="text-upwork-green mb-3" />
            <h3 className="text-lg font-semibold text-ink mb-1">No pending verifications</h3>
            <p className="text-sm text-gray-400">All bank transfers have been verified</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal: any) => (
              <div key={deal._id} className="card card-body border-amber-200">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-base font-semibold text-ink truncate">{deal.title}</p>
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-xs">Awaiting Verification</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {deal.dealNumber} · Buyer: <strong>{deal.buyer?.fullName}</strong> ({deal.buyer?.phone})
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span>Amount: <strong className="text-ink">{formatPKR(deal.amountInPaisa)}</strong></span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">Submitted: {timeAgo(deal.payment?.paidAt)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {deal.payment?.ibftScreenshotUrl && (
                      <a
                        href={deal.payment.ibftScreenshotUrl}
                        target="_blank"
                        rel="noopener"
                        className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5"
                      >
                        <ExternalLink size={14} /> View Screenshot
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Confirm bank transfer of ${formatPKR(deal.amountInPaisa)} for deal ${deal.dealNumber}?`)) {
                          confirmMutation.mutate(deal._id);
                        }
                      }}
                      disabled={confirmMutation.isPending}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      {confirmMutation.isPending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle2 size={14} />
                      }
                      Confirm & Fund Deal
                    </button>
                  </div>
                </div>

                {/* Bank details summary */}
                <div className="mt-4 pt-4 border-t border-gray-75 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400 mb-0.5">Buyer Bank Details</p>
                    <p className="font-medium text-ink">{deal.buyer?.bankDetails?.bankName || 'Not provided'}</p>
                    <p className="text-gray-500 font-mono">{deal.buyer?.bankDetails?.iban || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-0.5">View Full Deal</p>
                    <Link href={`/admin/deals/${deal._id}`} className="text-upwork-green font-medium hover:underline flex items-center gap-1">
                      Open Deal <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
