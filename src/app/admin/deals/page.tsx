'use client';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, ChevronRight, Flag } from 'lucide-react';
import api from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, formatDate } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">All Deals</h1>
            <p className="section-sub">{data?.total || 0} total deals on platform</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card card-sm flex gap-3 flex-wrap mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title, deal number…" className="input pl-9 py-2 text-sm" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={flagged} onChange={e => setFlagged(e.target.checked)} className="w-4 h-4 accent-upwork-green" />
            <Flag size={14} className="text-red-400" /> Flagged only
          </label>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-upwork">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-24" /></td>
                      ))}
                    </tr>
                  ))
                ) : deals.map((deal: any) => (
                  <tr key={deal._id}>
                    <td>
                      <div>
                        <p className="text-sm font-medium text-ink line-clamp-1 max-w-[200px]">{deal.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{deal.dealNumber}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-ink">{deal.buyer?.fullName}</p>
                        <p className="text-xs text-gray-400">{deal.buyer?.email}</p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-ink">{deal.seller?.fullName}</p>
                        <p className="text-xs text-gray-400">{deal.seller?.email}</p>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm font-semibold text-ink">{formatPKR(deal.amountInPaisa)}</p>
                    </td>
                    <td><StatusBadge status={deal.status} /></td>
                    <td className="text-xs text-gray-400">{formatDate(deal.createdAt)}</td>
                    <td>
                      <Link href={`/admin/deals/${deal._id}`} className="text-gray-400 hover:text-ink">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-75">
              <p className="text-sm text-gray-400">Page {page} of {data.pages} · {data.total} deals</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost btn-sm px-3">←</button>
                <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages} className="btn-ghost btn-sm px-3">→</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
