'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, Clock, CheckCircle2, ArrowRight, Download } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatPKR, formatDate, getInitials, cn } from '@/lib/utils';
import StatusBadge from '@/components/deals/StatusBadge';

export default function EarningsPage() {
  const { user } = useAuthStore();

  const { data: sellerDeals, isLoading } = useQuery({
    queryKey: ['seller-deals-all'],
    queryFn: () => api.get('/deals/my?role=seller&limit=100').then(r => r.data.data),
  });

  const deals = sellerDeals?.deals || [];
  const completed  = deals.filter((d: any) => d.status === 'COMPLETED');
  const inEscrow   = deals.filter((d: any) => ['FUNDED','DELIVERED'].includes(d.status));
  const disputed   = deals.filter((d: any) => d.status === 'DISPUTED');

  const totalEarned  = completed.reduce((s: number, d: any) => s + (d.sellerPayoutInPaisa || 0), 0);
  const pendingEscrow= inEscrow.reduce((s: number, d: any) => s + (d.sellerPayoutInPaisa || 0), 0);
  const avgDeal      = completed.length ? Math.round(totalEarned / completed.length) : 0;

  // Monthly chart data — last 6 months
  const monthlyData = (() => {
    const map: Record<string, number> = {};
    completed.forEach((d: any) => {
      const key = new Date(d.completedAt).toLocaleDateString('en-PK', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + (d.sellerPayoutInPaisa || 0);
    });
    return Object.entries(map).slice(-6).map(([month, amount]) => ({ month, amount }));
  })();

  return (
    <div className="space-y-8 animate-in">
      {/* ── HEADER ── */}
      <div>
        <h1 className="section-title">Earnings & Payouts</h1>
        <p className="section-sub">Your income summary and transaction history</p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned',    value: formatPKR(totalEarned),   icon: <Wallet size={20} className="text-upwork-green" />,  bg: 'bg-upwork-green-l', loading: isLoading },
          { label: 'In Escrow',       value: formatPKR(pendingEscrow), icon: <Clock size={20} className="text-blue-500" />,       bg: 'bg-blue-50',        loading: isLoading },
          { label: 'Avg Deal Value',  value: formatPKR(avgDeal),       icon: <TrendingUp size={20} className="text-purple-500" />,bg: 'bg-purple-50',      loading: isLoading },
          { label: 'Completed Deals', value: completed.length.toString(), icon: <CheckCircle2 size={20} className="text-upwork-green" />, bg: 'bg-upwork-green-l', loading: isLoading },
        ].map(({ label, value, icon, bg, loading }) => (
          <div key={label} className="card card-body flex flex-col gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bg)}>{icon}</div>
            {loading ? <div className="h-7 w-20 bg-gray-100 rounded animate-pulse" /> : (
              <div className="text-2xl font-semibold text-ink tracking-tight">{value}</div>
            )}
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ── CHART ── */}
      {monthlyData.length > 0 && (
        <div className="card card-body">
          <h2 className="text-base font-semibold text-ink mb-4">Monthly Earnings</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#737373' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `Rs.${(v/100/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  formatter={(v: any) => [formatPKR(v), 'Earned']}
                  contentStyle={{ fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 8 }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((_: any, i: number) => (
                    <Cell key={i} fill={i === monthlyData.length - 1 ? '#14a800' : '#d5ead5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── IN ESCROW ── */}
      {inEscrow.length > 0 && (
        <div className="card">
          <div className="card-body pb-0">
            <h2 className="text-base font-semibold text-ink mb-1">Funds In Escrow</h2>
            <p className="text-sm text-gray-500 mb-4">These funds will be released when buyers approve your work</p>
            <div className="divide-y divide-gray-75">
              {inEscrow.map((deal: any) => (
                <EarningsRow key={deal._id} deal={deal} showPayout />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETED DEALS ── */}
      <div className="card">
        <div className="card-body pb-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">Completed Deals</h2>
            <span className="text-sm text-gray-400">{completed.length} transactions</span>
          </div>
          {!completed.length ? (
            <div className="py-12 text-center">
              <Wallet size={32} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No completed deals yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-75">
              {completed.map((deal: any) => <EarningsRow key={deal._id} deal={deal} showPayout />)}
            </div>
          )}
        </div>
      </div>

      {/* ── BANK DETAILS REMINDER ── */}
      {!user?.bankDetails?.iban && (
        <div className="card card-body border-amber-200 bg-amber-50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Wallet size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Add your bank details to receive payouts</p>
              <p className="text-xs text-amber-600 mb-3">Without bank details, we cannot process payouts for completed deals.</p>
              <Link href="/dashboard/profile" className="btn-secondary text-sm px-4 py-2">
                Add Bank Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EarningsRow({ deal, showPayout }: { deal: any; showPayout?: boolean }) {
  return (
    <Link href={`/dashboard/deals/${deal._id}`} className="flex items-center gap-4 py-3.5 hover:bg-gray-50/70 -mx-6 px-6 transition-colors group">
      <div>
        <p className="text-sm font-medium text-ink group-hover:text-upwork-green transition-colors line-clamp-1">{deal.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{deal.dealNumber} · {formatDate(deal.updatedAt)}</p>
      </div>
      <div className="ml-auto flex items-center gap-4 flex-shrink-0">
        <StatusBadge status={deal.status} />
        <div className="text-right">
          <p className="text-sm font-semibold text-upwork-green">{formatPKR(deal.sellerPayoutInPaisa)}</p>
          {showPayout && <p className="text-xs text-gray-400">after 2% fee</p>}
        </div>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-upwork-green" />
      </div>
    </Link>
  );
}
