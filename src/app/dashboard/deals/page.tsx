'use client';
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search, Plus, Filter, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPKR, timeAgo, getInitials, CATEGORY_LABELS, daysRemaining, hoursRemaining } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

const STATUS_TABS = [
  { label: 'All',       value: '' },
  { label: 'Active',    value: 'FUNDED' },
  { label: 'Pending',   value: 'PENDING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Disputed',  value: 'DISPUTED' },
];

export default function MyDealsPage() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-deals', status, role, page, search],
    queryFn: () => api.get('/deals/my', {
      params: { status: status || undefined, role: role || undefined, page, limit: 10, search: search || undefined },
    }).then(r => r.data.data),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6 animate-in">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">My Deals</h1>
          <p className="section-sub">
            {data?.total ? `${data.total} total deals` : 'All your escrow transactions'}
          </p>
        </div>
        <Link href="/dashboard/deals/create" className="btn-primary self-start">
          <Plus size={16} /> New Deal
        </Link>
      </div>

      {/* ── FILTERS ── */}
      <div className="card card-sm">
        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-thin pb-1 mb-4">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatus(tab.value); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                status === tab.value
                  ? 'bg-upwork-green text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title or deal number…"
              className="input pl-9 py-2 text-sm"
            />
          </div>

          {/* Role filter */}
          <select
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
            className="input py-2 text-sm w-auto pr-8"
          >
            <option value="">All Roles</option>
            <option value="buyer">As Buyer</option>
            <option value="seller">As Seller</option>
          </select>
        </div>
      </div>

      {/* ── DEALS LIST ── */}
      {isLoading ? (
        <DealsListSkeleton />
      ) : !data?.deals?.length ? (
        <EmptyState status={status} />
      ) : (
        <div className="space-y-3">
          {data.deals.map((deal: any) => (
            <DealCard key={deal._id} deal={deal} userId={user?._id} />
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {page} of {data.pages} · {data.total} total
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost btn-sm px-3 py-1.5"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="btn-ghost btn-sm px-3 py-1.5"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DEAL CARD ─────────────────────────────────────────────────────────────────
function DealCard({ deal, userId }: { deal: any; userId?: string }) {
  const isBuyer = deal.buyer?._id === userId;
  const other   = isBuyer ? deal.seller : deal.buyer;
  const hrs     = deal.autoApprovalDeadline ? hoursRemaining(deal.autoApprovalDeadline) : null;
  const urgentReview = deal.status === 'DELIVERED' && hrs !== null && hrs < 24;

  return (
    <Link
      href={`/dashboard/deals/${deal._id}`}
      className="card card-hover block"
    >
      <div className="card-body">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Avatar */}
          <div className="avatar w-11 h-11 text-sm flex-shrink-0">
            {other?.avatar
              ? <img src={other.avatar} alt="" className="w-full h-full" />
              : <span>{getInitials(other?.fullName || 'U')}</span>
            }
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-ink hover:text-upwork-green transition-colors line-clamp-1">
                {deal.title}
              </h3>
              <StatusBadge status={deal.status} />
              {isBuyer
                ? <span className="badge bg-blue-50 text-blue-600 border-0">Buyer</span>
                : <span className="badge bg-purple-50 text-purple-600 border-0">Seller</span>
              }
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>{isBuyer ? `Seller: ${other?.fullName}` : `Buyer: ${other?.fullName}`}</span>
              <span>·</span>
              <span>{deal.dealNumber}</span>
              <span>·</span>
              <span>{CATEGORY_LABELS[deal.category] || deal.category}</span>
              <span>·</span>
              <span>Updated {timeAgo(deal.updatedAt)}</span>
            </div>

            {/* Urgent review warning */}
            {urgentReview && (
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full w-fit">
                ⏰ Auto-approves in {hrs} hour{hrs !== 1 ? 's' : ''} — Review now
              </div>
            )}

            {/* Delivery deadline */}
            {deal.status === 'FUNDED' && deal.deadline && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                📅 Deadline: {daysRemaining(deal.deadline)} days remaining
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-semibold text-ink tracking-tight">
              {formatPKR(deal.amountInPaisa)}
            </p>
            {deal.status === 'COMPLETED' && !isBuyer && (
              <p className="text-xs text-upwork-green mt-0.5 font-medium">
                Earned {formatPKR(deal.sellerPayoutInPaisa)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function DealsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card card-body">
          <div className="flex gap-4 animate-pulse">
            <div className="w-11 h-11 bg-gray-100 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-100 rounded w-3/4" />
              <div className="h-4 bg-gray-75 rounded w-1/2" />
            </div>
            <div className="h-7 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ status }: { status: string }) {
  return (
    <div className="card card-body flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-upwork-green-l rounded-full flex items-center justify-center mb-4">
        <Filter size={28} className="text-upwork-green" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">
        No {status ? status.toLowerCase() : ''} deals found
      </h3>
      <p className="text-gray-500 text-sm mb-5">
        {status ? `You have no deals with status "${status}"` : "You haven't created any deals yet"}
      </p>
      <Link href="/dashboard/deals/create" className="btn-primary">
        <Plus size={16} /> Create a Deal
      </Link>
    </div>
  );
}
