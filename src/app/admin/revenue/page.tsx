'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { TrendingUp, Wallet, CheckCircle2, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatPKR, cn } from '@/lib/utils';

export default function AdminRevenuePage() {
  const adminApiEnabled = useAdminApiEnabled();
  const [groupBy, setGroupBy] = useState<'day'|'week'|'month'>('day');
  const [days, setDays] = useState(30);

  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const to   = new Date().toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue', groupBy, days],
    queryFn: () => api.get('/admin/revenue', { params: { from, to, groupBy } }).then(r => r.data.data),
    enabled: adminApiEnabled,
  });

  const report = data?.report  || [];
  const totals = data?.totals  || {};

  const statCards = [
    { label: 'Total Revenue',   value: formatPKR(totals.totalRevenue || 0),  icon: Wallet,       bg: 'bg-emerald-50', ic: 'text-emerald-600' },
    { label: 'Total Volume',    value: formatPKR(totals.totalVolume  || 0),  icon: TrendingUp,   bg: 'bg-blue-50',    ic: 'text-blue-600' },
    { label: 'Completed Deals', value: totals.totalDeals || 0,               icon: CheckCircle2, bg: 'bg-purple-50',  ic: 'text-purple-600' },
    { label: 'Avg Deal Size',   value: totals.totalDeals ? formatPKR(Math.round((totals.totalVolume||0) / totals.totalDeals)) : 'N/A', icon: BarChart2, bg: 'bg-amber-50', ic: 'text-amber-600' },
  ];

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Revenue Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform earnings and transaction volume</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  days === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {d}d
              </button>
            ))}
          </div>
          <select
            value={groupBy}
            onChange={e => setGroupBy(e.target.value as any)}
            className="h-9 px-3 text-sm bg-white border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-all shadow-sm"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, ic }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
              <Icon size={18} className={ic} />
            </div>
            {isLoading
              ? <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse mb-1" />
              : <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            }
            <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        {isLoading ? (
          <div className="h-56 bg-gray-50 rounded-xl animate-pulse" />
        ) : report.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <BarChart2 size={22} className="text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-600">No revenue data for this period</p>
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#059669" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `Rs.${((v||0)/100/1000).toFixed(0)}K`}
                  tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip
                  formatter={(v: any) => [formatPKR(v), 'Revenue']}
                  contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Volume + Deals */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Deal Volume (PKR)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${((v||0)/100/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip formatter={(v: any) => [formatPKR(v), 'Volume']} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="totalVolume" radius={[4,4,0,0]}>
                  {report.map((_: any, i: number) => (
                    <Cell key={i} fill={i === report.length-1 ? '#2563eb' : '#dbeafe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Completed Deals Count</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="totalDeals" radius={[4,4,0,0]}>
                  {report.map((_: any, i: number) => (
                    <Cell key={i} fill={i === report.length-1 ? '#059669' : '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Detailed Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {['Period','Completed Deals','Total Volume','Platform Revenue (2%)','Avg Deal Size'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : report.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-400 py-10 text-sm">No data for this period</td></tr>
              ) : report.map((row: any) => (
                <tr key={row._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{row._id}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">{row.totalDeals}</td>
                  <td className="px-5 py-3.5 text-gray-700">{formatPKR(row.totalVolume)}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-600">{formatPKR(row.totalRevenue)}</td>
                  <td className="px-5 py-3.5 text-gray-700">{row.totalDeals ? formatPKR(Math.round(row.totalVolume / row.totalDeals)) : '—'}</td>
                </tr>
              ))}
            </tbody>
            {!isLoading && report.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-5 py-3.5 text-xs font-bold text-gray-600 uppercase">Total</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{totals.totalDeals}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{formatPKR(totals.totalVolume)}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-emerald-600">{formatPKR(totals.totalRevenue)}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-gray-900">
                    {totals.totalDeals ? formatPKR(Math.round(totals.totalVolume / totals.totalDeals)) : '—'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
