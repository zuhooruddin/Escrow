'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, FileText, Clock, CheckCircle2, AlertTriangle,
  Plus, ArrowRight, Wallet, ShieldCheck, Eye,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';
import { formatPKR, timeAgo, getStatusConfig, getInitials, cn } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';
import '../../styles/globals.css';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const authHydrated = useAuthHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!authHydrated) return;
    if (user?.role === 'admin') router.replace('/admin');
  }, [authHydrated, user?.role, router]);

  const isMemberDashboard = authHydrated && user?.role !== 'admin';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/deals/dashboard').then(r => r.data.data),
    enabled: isMemberDashboard,
  });

  const { data: dealsData } = useQuery({
    queryKey: ['my-deals', 'recent'],
    queryFn: () => api.get('/deals/my?limit=5').then(r => r.data.data),
    enabled: isMemberDashboard,
  });

  const name = user?.fullName?.split(' ')[0] || 'there';

  // Aggregate stats from buyer + seller data
  const buyerStats = data?.buyerStats || [];
  const sellerStats = data?.sellerStats || [];

  const totalBuyerDeals  = buyerStats.reduce((s: number, x: any) => s + x.count, 0);
  const totalSellerDeals = sellerStats.reduce((s: number, x: any) => s + x.count, 0);
  const totalSpent       = buyerStats.reduce((s: number, x: any) => s + (x.totalAmount || 0), 0);
  const totalEarned      = sellerStats.reduce((s: number, x: any) => s + (x.totalPayout || 0), 0);

  const activeDeals = [...buyerStats, ...sellerStats]
    .filter((x: any) => ['PENDING','FUNDED','DELIVERED','DISPUTED'].includes(x._id))
    .reduce((s: number, x: any) => s + x.count, 0);

  const completedDeals = [...buyerStats, ...sellerStats]
    .filter((x: any) => x._id === 'COMPLETED')
    .reduce((s: number, x: any) => s + x.count, 0);

  const disputes = [...buyerStats, ...sellerStats]
    .filter((x: any) => x._id === 'DISPUTED')
    .reduce((s: number, x: any) => s + x.count, 0);

  return (
    <div className="space-y-8 animate-in">

      {/* ── GREETING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink tracking-tight">
            Good to see you, {name} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-base">
            Here's what's happening with your escrow deals
          </p>
        </div>
        <Link href="/dashboard/deals/create" className="btn-primary self-start sm:self-auto">
          <Plus size={17} />
          Create New Deal
        </Link>
      </div>

      {/* ── KYC BANNER ── */}
      {user?.kyc?.status !== 'approved' && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
            <ShieldCheck size={20} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {user?.kyc?.status === 'pending' && 'Complete your identity verification'}
              {user?.kyc?.status === 'submitted' && 'KYC under review — we\'ll notify you within 24 hours'}
              {user?.kyc?.status === 'rejected' && 'KYC rejected — please resubmit your documents'}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              KYC verification is required to create funded deals on EscrowPK
            </p>
          </div>
          {user?.kyc?.status !== 'submitted' && (
            <Link href="/dashboard/profile" className="btn-secondary px-4 py-2 text-sm flex-shrink-0">
              Verify Now
            </Link>
          )}
        </div>
      )}

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Deals"
          value={isLoading ? '—' : activeDeals.toString()}
          icon={<Clock size={20} className="text-blue-500" />}
          bg="bg-blue-50"
          loading={isLoading}
        />
        <StatCard
          label="Completed"
          value={isLoading ? '—' : completedDeals.toString()}
          icon={<CheckCircle2 size={20} className="text-upwork-green" />}
          bg="bg-upwork-green-l"
          loading={isLoading}
        />
        <StatCard
          label="Total Spent"
          value={isLoading ? '—' : formatPKR(totalSpent)}
          icon={<TrendingUp size={20} className="text-purple-500" />}
          bg="bg-purple-50"
          loading={isLoading}
          small
        />
        <StatCard
          label="Total Earned"
          value={isLoading ? '—' : formatPKR(totalEarned)}
          icon={<Wallet size={20} className="text-upwork-green" />}
          bg="bg-upwork-green-l"
          loading={isLoading}
          small
        />
      </div>

      {/* ── OPEN DISPUTES ALERT ── */}
      {disputes > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            You have <strong>{disputes}</strong> open dispute{disputes > 1 ? 's' : ''}.
            {' '}<Link href="/dashboard/deals?status=DISPUTED" className="underline">View disputes →</Link>
          </p>
        </div>
      )}

      {/* ── RECENT DEALS ── */}
      <div className="card">
        <div className="card-body pb-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-ink">Recent Deals</h2>
            <Link href="/dashboard/deals" className="text-sm text-upwork-green font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {!dealsData?.deals?.length ? (
            <EmptyDeals />
          ) : (
            <div className="divide-y divide-gray-75">
              {dealsData.deals.map((deal: any) => (
                <DealRow key={deal._id} deal={deal} userId={user?._id} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        <QuickAction
          href="/dashboard/deals/create"
          icon={<Plus size={22} className="text-upwork-green" />}
          title="Create Deal"
          desc="Start a new secure escrow transaction"
          bg="bg-upwork-green-l"
        />
        <QuickAction
          href="/dashboard/deals?status=DELIVERED"
          icon={<Eye size={22} className="text-blue-500" />}
          title="Review Work"
          desc="Check delivered work and approve payment"
          bg="bg-blue-50"
        />
        <QuickAction
          href="/dashboard/earnings"
          icon={<Wallet size={22} className="text-purple-500" />}
          title="View Earnings"
          desc="Track your income and payout history"
          bg="bg-purple-50"
        />
      </div>
    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, bg, loading, small }: any) {
  return (
    <div className="card card-body flex flex-col gap-3">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bg)}>
        {icon}
      </div>
      {loading ? (
        <div className="space-y-1.5">
          <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-75 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className={cn('font-semibold text-ink tracking-tight', small ? 'text-xl' : 'text-3xl')}>
            {value}
          </div>
          <p className="text-sm text-gray-500">{label}</p>
        </>
      )}
    </div>
  );
}

function DealRow({ deal, userId }: { deal: any; userId?: string }) {
  const isBuyer = deal.buyer?._id === userId;
  const other = isBuyer ? deal.seller : deal.buyer;

  return (
    <Link href={`/dashboard/deals/${deal._id}`} className="flex items-center gap-4 py-4 hover:bg-gray-50/60 -mx-6 px-6 transition-colors group">
      {/* Avatar */}
      <div className="avatar w-10 h-10 text-sm flex-shrink-0">
        {other?.avatar
          ? <img src={other.avatar} alt="" className="w-full h-full" />
          : <span>{getInitials(other?.fullName || 'U')}</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-ink truncate">{deal.title}</p>
          <StatusBadge status={deal.status} />
        </div>
        <p className="text-xs text-gray-500">
          {isBuyer ? `Seller: ${other?.fullName}` : `Buyer: ${other?.fullName}`}
          {' · '}{timeAgo(deal.updatedAt)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-ink">{formatPKR(deal.amountInPaisa)}</p>
        <p className="text-xs text-gray-400">{deal.dealNumber}</p>
      </div>

      <ArrowRight size={16} className="text-gray-300 group-hover:text-upwork-green transition-colors flex-shrink-0" />
    </Link>
  );
}

function EmptyDeals() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-upwork-green-l rounded-full flex items-center justify-center mb-4">
        <FileText size={28} className="text-upwork-green" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">No deals yet</h3>
      <p className="text-gray-500 text-sm mb-5 max-w-xs">
        Start by creating your first escrow deal. It's free and takes less than 2 minutes.
      </p>
      <Link href="/dashboard/deals/create" className="btn-primary">
        <Plus size={16} /> Create First Deal
      </Link>
    </div>
  );
}

function QuickAction({ href, icon, title, desc, bg }: any) {
  return (
    <Link href={href} className="card card-hover card-body flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
