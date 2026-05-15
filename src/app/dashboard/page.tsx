'use client';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp, FileText, Clock, CheckCircle2, AlertTriangle,
  Plus, ArrowRight, Wallet, ShieldCheck, Eye, ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';
import { formatPKR, timeAgo, getInitials, cn } from '@/lib/utils';
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

  const buyerStats  = data?.buyerStats  || [];
  const sellerStats = data?.sellerStats || [];

  const totalSpent   = buyerStats.reduce((s: number, x: any)  => s + (x.totalAmount  || 0), 0);
  const totalEarned  = sellerStats.reduce((s: number, x: any) => s + (x.totalPayout  || 0), 0);

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
    <div className="space-y-6">

      {/* ── GREETING ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Good to see you, {name} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here's what's happening with your escrow deals.
          </p>
        </div>
        <Link
          href="/dashboard/deals/create"
          className="hidden sm:flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          Create New Deal
        </Link>
      </div>

      {/* ── KYC BANNER ── */}
      {user?.kyc?.status !== 'approved' && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
            <ShieldCheck size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {user?.kyc?.status === 'pending'   && 'Complete your identity verification'}
              {user?.kyc?.status === 'submitted' && "KYC under review — we'll notify you within 24 hours"}
              {user?.kyc?.status === 'rejected'  && 'KYC rejected — please resubmit your documents'}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              KYC verification is required to create funded deals on EscrowPK
            </p>
          </div>
          {user?.kyc?.status !== 'submitted' && (
            <Link href="/dashboard/profile" className="text-sm font-semibold text-amber-700 border border-amber-300 bg-white hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              Verify Now
            </Link>
          )}
        </div>
      )}

      {/* ── OPEN DISPUTES ALERT ── */}
      {disputes > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            You have <strong>{disputes}</strong> open dispute{disputes > 1 ? 's' : ''}.
            {' '}<Link href="/dashboard/deals?status=DISPUTED" className="underline">View disputes →</Link>
          </p>
        </div>
      )}

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Deals"
          value={isLoading ? '—' : activeDeals}
          sub={activeDeals === 0 ? 'No active deals' : `${activeDeals} in progress`}
          icon={<Clock size={20} className="text-blue-600" />}
          iconBg="bg-blue-50"
          loading={isLoading}
          money={false}
        />
        <StatCard
          label="Completed Deals"
          value={isLoading ? '—' : completedDeals}
          sub={completedDeals === 0 ? 'No completed deals' : `${completedDeals} finished`}
          icon={<CheckCircle2 size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          loading={isLoading}
          money={false}
        />
        <StatCard
          label="Total Spent"
          value={isLoading ? '—' : totalSpent}
          sub="Across all deals"
          icon={<TrendingUp size={20} className="text-purple-600" />}
          iconBg="bg-purple-50"
          loading={isLoading}
          money={true}
        />
        <StatCard
          label="Total Earned"
          value={isLoading ? '—' : totalEarned}
          sub="Lifetime earnings"
          icon={<Wallet size={20} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          loading={isLoading}
          money={true}
        />
      </div>

      {/* ── BOTTOM ROW: Recent Deals + Overview ── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">

        {/* Recent Deals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">Recent Deals</h2>
            <Link
              href="/dashboard/deals"
              className="flex items-center gap-1 text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              View all deals <ArrowRight size={14} />
            </Link>
          </div>

          {!dealsData?.deals?.length ? (
            <EmptyDeals />
          ) : (
            <div className="divide-y divide-gray-50">
              {dealsData.deals.map((deal: any) => (
                <DealRow key={deal._id} deal={deal} userId={user?._id} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">

          {/* Overview card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Overview</h2>
              <span className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 font-medium">This Month</span>
            </div>

            <div className="flex items-center gap-5 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-500 font-medium">Spent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500 font-medium">Earned</span>
              </div>
            </div>

            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                <p className="text-lg font-bold text-gray-900">{formatPKR(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">Earned</p>
                <p className="text-lg font-bold text-gray-900">{formatPKR(totalEarned)}</p>
              </div>
            </div>

            {/* Mini chart placeholder */}
            <div className="relative h-16 mt-2">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-0.5 h-full">
                {[2,4,3,5,2,6,4,3,5,7,4,6,3,5,8,4,6,3,7,5,4,6,3,5,4,6,5,4,6,3].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-100 rounded-sm"
                    style={{ height: `${h * 8}%` }}
                  />
                ))}
              </div>
              {totalSpent === 0 && totalEarned === 0 && (
                <div className="absolute inset-0 border-b border-dashed border-gray-200" />
              )}
            </div>
            <div className="flex justify-between mt-1">
              {['1','10','20','30'].map(d => (
                <span key={d} className="text-[10px] text-gray-400">{d}</span>
              ))}
            </div>
          </div>

          {/* Escrow Protection card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Escrow Protection</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your transactions are protected with industry-standard security and privacy.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <ShieldCheck size={96} className="text-emerald-600" />
            </div>
            <div className="absolute right-3 bottom-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <QuickAction
            href="/dashboard/deals/create"
            icon={<Plus size={22} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            title="Create Deal"
            desc="Start a new secure escrow transaction"
          />
          <QuickAction
            href="/dashboard/deals?status=DELIVERED"
            icon={<Eye size={22} className="text-purple-600" />}
            iconBg="bg-purple-50"
            title="Review Work"
            desc="Check delivered work and approve payment"
          />
          <QuickAction
            href="/dashboard/earnings"
            icon={<Wallet size={22} className="text-blue-600" />}
            iconBg="bg-blue-50"
            title="View Earnings"
            desc="Track your income and payout history"
          />
        </div>
      </div>

    </div>
  );
}

// ── SUB-COMPONENTS ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon, iconBg, loading, money }: {
  label: string; value: any; sub: string;
  icon: React.ReactNode; iconBg: string; loading: boolean; money: boolean;
}) {
  const display = loading ? '—' : money ? formatPKR(value) : value.toString();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', iconBg)}>
        {icon}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-3.5 w-24 bg-gray-75 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{display}</p>
          <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </>
      )}
    </div>
  );
}

function DealRow({ deal, userId }: { deal: any; userId?: string }) {
  const isBuyer = deal.buyer?._id === userId;
  const other = isBuyer ? deal.seller : deal.buyer;

  return (
    <Link
      href={`/dashboard/deals/${deal._id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {other?.avatar
          ? <img src={other.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          : getInitials(other?.fullName || 'U')
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{deal.title}</p>
          <StatusBadge status={deal.status} />
        </div>
        <p className="text-xs text-gray-500">
          {isBuyer ? `Seller: ${other?.fullName}` : `Buyer: ${other?.fullName}`}
          {' · '}{timeAgo(deal.updatedAt)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">{formatPKR(deal.amountInPaisa)}</p>
        <p className="text-xs text-gray-400">{deal.dealNumber}</p>
      </div>

      <ChevronRight size={15} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

function EmptyDeals() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
        <FileText size={26} className="text-emerald-500" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">No deals yet</h3>
      <p className="text-sm text-gray-500 mb-5 max-w-xs leading-relaxed">
        Start by creating your first escrow deal. It's free and takes less than 2 minutes.
      </p>
      <Link
        href="/dashboard/deals/create"
        className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        <Plus size={15} /> Create Your First Deal
      </Link>
    </div>
  );
}

function QuickAction({ href, icon, iconBg, title, desc }: {
  href: string; icon: React.ReactNode; iconBg: string; title: string; desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow group"
    >
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5" />
    </Link>
  );
}
