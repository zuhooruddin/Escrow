'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Users, FileText, AlertTriangle, ShieldCheck,
  Wallet, ArrowRight, Clock, CheckCircle2, Building2,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated, useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatPKR, formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const authHydrated = useAuthHydrated();
  const adminApiEnabled = useAdminApiEnabled();
  const router = useRouter();

  useEffect(() => {
    if (!authHydrated) return;
    if (isAuthenticated && user?.role !== 'admin') router.push('/dashboard');
    if (!isAuthenticated) router.push('/auth/login');
  }, [authHydrated, isAuthenticated, user, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-ink tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-upwork-green-l px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-upwork-green animate-pulse" />
            Live monitoring
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Deals',       value: stats.totalDeals,           icon: <FileText size={20} />,     color: 'blue',   href: '/admin/deals' },
            { label: 'Active Disputes',   value: stats.activeDisputes,       icon: <AlertTriangle size={20} />,color: 'red',    href: '/admin/disputes' },
            { label: 'Pending KYC',       value: stats.pendingKYC,           icon: <ShieldCheck size={20} />, color: 'amber',  href: '/admin/kyc' },
            { label: 'Total Users',       value: stats.totalUsers,           icon: <Users size={20} />,        color: 'purple', href: '/admin/users' },
            { label: 'Deals This Month',  value: stats.dealsThisMonth,       icon: <TrendingUp size={20} />,   color: 'green',  href: '/admin/deals' },
            { label: 'Revenue (30 days)', value: stats.revenueThisMonthPKR ? `Rs. ${stats.revenueThisMonthPKR.toLocaleString()}` : '—', icon: <Wallet size={20} />, color: 'green', href: '/admin/revenue' },
            { label: 'Escrow Held',       value: stats.escrowHeldPKR ? `Rs. ${stats.escrowHeldPKR.toLocaleString()}` : '—', icon: <Building2 size={20} />, color: 'blue', href: '/admin/deals?status=FUNDED' },
            { label: 'Pending IBFT',      value: stats.pendingIBFT,          icon: <Clock size={20} />,        color: 'amber',  href: '/admin/ibft' },
          ].map(({ label, value, icon, color, href }) => (
            <Link key={label} href={href} className="card card-hover card-body flex flex-col gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center',
                color === 'blue'   && 'bg-blue-50 text-blue-500',
                color === 'red'    && 'bg-red-50 text-red-500',
                color === 'amber'  && 'bg-amber-50 text-amber-500',
                color === 'green'  && 'bg-upwork-green-l text-upwork-green',
                color === 'purple' && 'bg-purple-50 text-purple-500',
              )}>
                {icon}
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                <div className="text-2xl font-semibold text-ink">{value ?? '—'}</div>
              )}
              <p className="text-sm text-gray-500">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── REVENUE CHART ── */}
          <div className="lg:col-span-2 card card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-ink">Revenue (Last 7 Days)</h2>
              <Link href="/admin/revenue" className="text-sm text-upwork-green hover:underline flex items-center gap-1">
                Full report <ArrowRight size={13} />
              </Link>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14a800" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#14a800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `Rs.${(v/100).toFixed(0)}`} tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 8 }}
                    formatter={(v: any) => [`Rs. ${(v/100).toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#001e00', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#14a800" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-ink">Quick Actions</h2>
            {[
              { href: '/admin/disputes?verdict=pending', label: 'Review Open Disputes', badge: stats.activeDisputes, color: 'red' },
              { href: '/admin/ibft-pending', label: 'Verify IBFT Payments', badge: stats.pendingIBFT, color: 'amber' },
              { href: '/admin/kyc-queue', label: 'Review KYC Queue', badge: stats.pendingKYC, color: 'blue' },
              { href: '/admin/deals', label: 'All Deals', badge: null, color: 'green' },
              { href: '/admin/users', label: 'Manage Users', badge: null, color: 'purple' },
            ].map(({ href, label, badge, color }) => (
              <Link key={href} href={href}
                className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-lg hover:border-upwork-green/30 hover:shadow-sm transition-all group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-ink">{label}</span>
                <div className="flex items-center gap-2">
                  {badge != null && badge > 0 && (
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full',
                      color === 'red'   && 'bg-red-100 text-red-700',
                      color === 'amber' && 'bg-amber-100 text-amber-700',
                      color === 'blue'  && 'bg-blue-100 text-blue-700',
                      color === 'green' && 'bg-upwork-green-l text-upwork-green',
                      color === 'purple'&& 'bg-purple-100 text-purple-700',
                    )}>
                      {badge}
                    </span>
                  )}
                  <ArrowRight size={14} className="text-gray-300 group-hover:text-upwork-green" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── DISPUTES + IBFT ── */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Open Disputes */}
          <div className="card">
            <div className="card-body pb-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Open Disputes
                </h2>
                <Link href="/admin/disputes" className="text-sm text-upwork-green hover:underline">View all</Link>
              </div>
              {!disputesData?.deals?.length ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-upwork-green mb-2" />
                  <p className="text-sm text-gray-500">No open disputes 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-75">
                  {disputesData.deals.map((deal: any) => (
                    <Link key={deal._id} href={`/admin/deals/${deal._id}`}
                      className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{deal.title}</p>
                        <p className="text-xs text-gray-400">{deal.dealNumber} · {formatPKR(deal.amountInPaisa)}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending IBFT */}
          <div className="card">
            <div className="card-body pb-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  Pending IBFT Verifications
                </h2>
                <Link href="/admin/ibft-pending" className="text-sm text-upwork-green hover:underline">View all</Link>
              </div>
              {!ibftData?.deals?.length ? (
                <div className="py-8 text-center">
                  <CheckCircle2 size={32} className="mx-auto text-upwork-green mb-2" />
                  <p className="text-sm text-gray-500">No pending bank transfers</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-75">
                  {ibftData.deals.slice(0, 5).map((deal: any) => (
                    <Link key={deal._id} href={`/admin/deals/${deal._id}`}
                      className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{deal.title}</p>
                        <p className="text-xs text-gray-400">{deal.buyer?.fullName} · {formatPKR(deal.amountInPaisa)}</p>
                      </div>
                      <span className="badge badge-pending text-xs">Verify</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
