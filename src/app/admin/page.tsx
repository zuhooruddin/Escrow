'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Users, FileText, AlertTriangle, ShieldCheck,
  Wallet, ChevronRight, Clock, CheckCircle2, Building2, BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatPKR, formatDate, cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const adminApiEnabled = useAdminApiEnabled();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') router.push('/dashboard');
  }, [isAuthenticated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then(r => r.data.data),
    refetchInterval: 60000,
    enabled: adminApiEnabled,
  });

  const { data: disputesData } = useQuery({
    queryKey: ['admin-disputes-preview'],
    queryFn: () => api.get('/admin/disputes?limit=5&verdict=pending').then(r => r.data.data),
    enabled: adminApiEnabled,
  });

  const { data: ibftData } = useQuery({
    queryKey: ['admin-ibft'],
    queryFn: () => api.get('/admin/ibft-pending').then(r => r.data.data),
    enabled: adminApiEnabled,
  });

  const stats = data?.overview || {};
  const chartData = data?.revenueByDay || [];

  const fmtPKR = (v: any) => v != null ? `PKR ${Number(v).toLocaleString()}` : '—';

  const row1 = [
    { label: 'Total Deals',     value: stats.totalDeals,     icon: FileText,      color: 'blue',   href: '/admin/deals',    delta: '0%', period: 'vs last 7 days' },
    { label: 'Active Disputes', value: stats.activeDisputes, icon: AlertTriangle, color: 'red',    href: '/admin/disputes', delta: '0%', period: 'vs last 7 days' },
    { label: 'Pending KYC',     value: stats.pendingKYC,     icon: ShieldCheck,   color: 'purple', href: '/admin/kyc-queue',delta: '0%', period: 'vs last 7 days' },
    { label: 'Total Users',     value: stats.totalUsers,     icon: Users,         color: 'violet', href: '/admin/users',    delta: '0%', period: 'vs last 7 days' },
  ];

  const row2 = [
    { label: 'Deals This Month',  value: stats.dealsThisMonth,       icon: TrendingUp, color: 'green',  href: '/admin/deals',               delta: '0%', period: 'vs last month' },
    { label: 'Revenue (30 days)', value: fmtPKR(stats.revenueThisMonthPKR ? stats.revenueThisMonthPKR / 100 : 0), icon: Wallet,     color: 'green',  href: '/admin/revenue',             delta: '0%', period: 'vs last 30 days', raw: true },
    { label: 'Escrow Held',       value: fmtPKR(stats.escrowHeldPKR ? stats.escrowHeldPKR / 100 : 0),             icon: Building2,  color: 'blue',   href: '/admin/deals?status=FUNDED', delta: '0%', period: 'vs last 30 days', raw: true },
    { label: 'Pending IBFT',      value: stats.pendingIBFT,          icon: Clock,      color: 'amber',  href: '/admin/ibft-pending',         delta: '0%', period: 'vs last 7 days' },
  ];

  const quickActions = [
    { href: '/admin/disputes?verdict=pending', label: 'Review Open Disputes',  icon: AlertTriangle, iconColor: 'text-red-500',    badge: stats.activeDisputes },
    { href: '/admin/ibft-pending',             label: 'Verify IBFT Payments',  icon: Building2,     iconColor: 'text-amber-500',  badge: stats.pendingIBFT },
    { href: '/admin/kyc-queue',                label: 'Review KYC Queue',       icon: ShieldCheck,   iconColor: 'text-emerald-600',badge: stats.pendingKYC },
    { href: '/admin/deals',                    label: 'All Deals',              icon: FileText,      iconColor: 'text-blue-500',   badge: null },
    { href: '/admin/users',                    label: 'Manage Users',           icon: Users,         iconColor: 'text-purple-500', badge: null },
  ];

  return (
    <div className="p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">Welcome back,</p>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rakhwali PK Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening on your platform today.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 border border-gray-200 bg-white px-3 py-2 rounded-xl shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          May 12 – May 18, 2025
          <ChevronRight size={13} className="text-gray-400 rotate-90" />
        </div>
      </div>

      {/* ── ROW 1 STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row1.map(s => <StatCard key={s.label} {...s} isLoading={isLoading} />)}
      </div>

      {/* ── ROW 2 STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {row2.map(s => <StatCard key={s.label} {...s} isLoading={isLoading} />)}
      </div>

      {/* ── REVENUE + QUICK ACTIONS ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">

        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Revenue Overview</h2>
            <span className="text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1 font-medium flex items-center gap-1">
              Last 7 Days <ChevronRight size={12} className="rotate-90 text-gray-400" />
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <BarChart2 size={26} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No revenue data available</p>
              <p className="text-xs text-gray-400 mt-1">Revenue data will appear here once deals are completed.</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `Rs.${(v/100).toFixed(0)}`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    formatter={(v: any) => [`Rs. ${(v/100).toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
          <div className="space-y-1">
            {quickActions.map(({ href, label, icon: Icon, iconColor, badge }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <Icon size={17} className={iconColor} />
                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                {badge != null && badge > 0 && (
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{badge}</span>
                )}
                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── DISPUTES + IBFT ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Open Disputes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500" />
              Open Disputes
            </h2>
            <Link href="/admin/disputes" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>

          {!disputesData?.deals?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                <AlertTriangle size={26} className="text-red-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No open disputes</p>
              <p className="text-xs text-gray-400 mt-1">Great! There are no open disputes at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {disputesData.deals.map((deal: any) => (
                <Link
                  key={deal._id}
                  href={`/admin/deals/${deal._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                    <p className="text-xs text-gray-400">{deal.dealNumber} · {formatPKR(deal.amountInPaisa)}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pending IBFT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock size={15} className="text-amber-500" />
              Pending IBFT Verifications
            </h2>
            <Link href="/admin/ibft-pending" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>

          {!ibftData?.deals?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                <Building2 size={26} className="text-amber-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No pending IBFT verifications</p>
              <p className="text-xs text-gray-400 mt-1">All caught up! No pending bank transfers.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {ibftData.deals.slice(0, 5).map((deal: any) => (
                <Link
                  key={deal._id}
                  href={`/admin/deals/${deal._id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                    <p className="text-xs text-gray-400">{deal.buyer?.fullName} · {formatPKR(deal.amountInPaisa)}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex-shrink-0">Verify</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string; value: any; icon: any; color: string;
  href: string; delta: string; period: string; isLoading: boolean; raw?: boolean;
};

function StatCard({ label, value, icon: Icon, color, href, delta, period, isLoading }: StatCardProps) {
  const colorMap: Record<string, { icon: string; bg: string }> = {
    blue:   { icon: 'text-blue-500',   bg: 'bg-blue-50' },
    red:    { icon: 'text-red-500',    bg: 'bg-red-50' },
    purple: { icon: 'text-purple-500', bg: 'bg-purple-50' },
    violet: { icon: 'text-violet-500', bg: 'bg-violet-50' },
    green:  { icon: 'text-emerald-600',bg: 'bg-emerald-50' },
    amber:  { icon: 'text-amber-500',  bg: 'bg-amber-50' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <Link href={href} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow block">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', c.bg)}>
          <Icon size={18} className={c.icon} />
        </div>
      </div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {isLoading ? (
        <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse mb-2" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 tracking-tight mb-2">{value ?? '0'}</p>
      )}
      <p className="text-xs text-gray-400">
        <span className="text-gray-500 font-medium">— {delta}</span> {period}
      </p>
    </Link>
  );
}
