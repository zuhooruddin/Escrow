'use client';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, ChevronRight, Flag, FileText } from 'lucide-react';
import api from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

const STATUSES = ['','PENDING','FUNDED','DELIVERED','COMPLETED','DISPUTED','REFUNDED','CANCELLED'];

export default function AdminDealsPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [flagged, setFlagged] = useState(false);

  const { data, isLoading } = useQuery<{ deals: any[]; total: number; pages: number }>({
    queryKey: ['admin-deals', search, status, page, flagged],
    queryFn: () => api.get('/admin/deals', {
      params: { search: search||undefined, status: status||undefined, page, limit: 20, flagged: flagged||undefined }
    }).then(r => r.data.data),
    placeholderData: keepPreviousData,
    enabled: adminApiEnabled,
  });

  const deals = data?.deals || [];

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Deals</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.total || 0} total deals on platform</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, deal number…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-all"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
          <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} className="w-3.5 h-3.5 accent-emerald-600" />
          <Flag size={13} className="text-red-400" />
          Flagged only
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Deal</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Seller</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <FileText size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">No deals found</p>
                      <p className="text-xs text-gray-400">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : deals.map((deal: any) => (
                <tr key={deal._id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[200px]">{deal.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{deal.dealNumber}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{deal.buyer?.fullName}</p>
                    <p className="text-xs text-gray-400">{deal.buyer?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-gray-800">{deal.seller?.fullName}</p>
                    <p className="text-xs text-gray-400">{deal.seller?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-900">{formatPKR(deal.amountInPaisa)}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={deal.status} /></td>
                  <td className="px-5 py-4 text-xs text-gray-400">{formatDate(deal.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/deals/${deal._id}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">Page {page} of {data.pages} · {data.total} deals</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p-1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >← Prev</button>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p+1))}
                disabled={page === data.pages}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
