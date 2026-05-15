'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, Loader2, Building2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate, timeAgo } from '@/lib/utils';

export default function AdminIBFTPendingPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
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
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">IBFT Verifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manually verify bank transfer payments and fund deals</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
          <Clock size={13} />
          {deals.length} pending
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : !deals.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <Building2 size={28} className="text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No pending verifications</h3>
          <p className="text-sm text-gray-400">All bank transfers have been verified</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal: any) => (
            <div key={deal._id} className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-base font-bold text-gray-900 truncate">{deal.title}</p>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex-shrink-0">
                        Awaiting Verification
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      <span className="font-mono text-gray-400">{deal.dealNumber}</span>
                      {' · '}Buyer: <strong className="text-gray-700">{deal.buyer?.fullName}</strong>
                      {' '}({deal.buyer?.phone})
                    </p>
                    <div className="flex items-center gap-5 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                        <p className="font-bold text-gray-900">{formatPKR(deal.amountInPaisa)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
                        <p className="font-medium text-gray-700">{timeAgo(deal.payment?.paidAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {deal.payment?.ibftScreenshotUrl && (
                      <a
                        href={deal.payment.ibftScreenshotUrl}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
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
                      className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {confirmMutation.isPending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <CheckCircle2 size={14} />
                      }
                      Confirm & Fund Deal
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">Buyer's Bank</p>
                  <p className="font-semibold text-gray-700">{deal.buyer?.bankDetails?.bankName || 'Not provided'}</p>
                  <p className="text-gray-500 font-mono">{deal.buyer?.bankDetails?.iban || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">View Full Deal</p>
                  <Link href={`/admin/deals/${deal._id}`} className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-1">
                    Open Deal <ExternalLink size={11} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
