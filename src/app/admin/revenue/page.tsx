'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { TrendingUp, Download, Calendar } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
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

  const report  = data?.report  || [];
  const totals  = data?.totals  || {};

  const statsCards = [
    { label: 'Total Revenue',    value: formatPKR(totals.totalRevenue  || 0), icon: '💰', color: 'bg-upwork-green-l text-upwork-green' },
    { label: 'Total Volume',     value: formatPKR(totals.totalVolume   || 0), icon: '📊', color: 'bg-blue-50 text-blue-600' },
    { label: 'Completed Deals',  value: totals.totalDeals || 0,              icon: '✅', color: 'bg-purple-50 text-purple-600' },
    { label: 'Avg Deal Size',    value: totals.totalDeals ? formatPKR(Math.round((totals.totalVolume||0) / totals.totalDeals)) : 'N/A', icon: '📈', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Revenue Reports</h1>
            <p className="section-sub">Platform earnings and transaction volume</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  days === d ? 'bg-upwork-green text-white' : 'text-gray-600 hover:bg-gray-100'
                )}>
                Last {d} days
              </button>
            ))}
            <select value={groupBy} onChange={e => setGroupBy(e.target.value as any)}
              className="input py-1.5 text-sm w-auto px-3">
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map(({ label, value, icon, color }) => (
            <div key={label} className="card card-body">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3', color)}>
                {icon}
              </div>
              {isLoading ? <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" /> : (
                <div className="text-2xl font-semibold text-ink tracking-tight">{value}</div>
              )}
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="card card-body mb-6">
          <h2 className="text-base font-semibold text-ink mb-4">Revenue Over Time</h2>
          {isLoading ? (
            <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
          ) : report.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No revenue data for this period
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={report} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#14a800" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#14a800" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => `Rs.${((v||0)/100/1000).toFixed(0)}K`}
                    tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={60}
                  />
                  <Tooltip
                    formatter={(v: any) => [formatPKR(v), 'Revenue']}
                    contentStyle={{ fontSize: 12, border: '1px solid #e8e8e8', borderRadius: 8 }}
                    labelStyle={{ fontWeight: 600, color: '#001e00' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#14a800" strokeWidth={2.5} fill="url(#revGrad2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Volume + Deals side by side */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Deal Volume (PKR)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${((v||0)/100/1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(v: any) => [formatPKR(v), 'Volume']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="totalVolume" radius={[3,3,0,0]}>
                    {report.map((_: any, i: number) => <Cell key={i} fill={i === report.length-1 ? '#1d72c9' : '#dbeafe'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Completed Deals Count</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="totalDeals" radius={[3,3,0,0]}>
                    {report.map((_: any, i: number) => <Cell key={i} fill={i === report.length-1 ? '#14a800' : '#d5ead5'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="card-body pb-0">
            <h3 className="text-base font-semibold text-ink mb-4">Detailed Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table-upwork">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Completed Deals</th>
                  <th>Total Volume</th>
                  <th>Platform Revenue (2%)</th>
                  <th>Avg Deal Size</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : report.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-8">No data for this period</td></tr>
                ) : (
                  report.map((row: any) => (
                    <tr key={row._id}>
                      <td className="font-mono text-sm">{row._id}</td>
                      <td className="font-semibold">{row.totalDeals}</td>
                      <td>{formatPKR(row.totalVolume)}</td>
                      <td className="text-upwork-green font-semibold">{formatPKR(row.totalRevenue)}</td>
                      <td>{row.totalDeals ? formatPKR(Math.round(row.totalVolume / row.totalDeals)) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {!isLoading && report.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-4 py-3 text-sm text-gray-600">TOTAL</td>
                    <td className="px-4 py-3 text-sm">{totals.totalDeals}</td>
                    <td className="px-4 py-3 text-sm">{formatPKR(totals.totalVolume)}</td>
                    <td className="px-4 py-3 text-sm text-upwork-green">{formatPKR(totals.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm">
                      {totals.totalDeals ? formatPKR(Math.round(totals.totalVolume / totals.totalDeals)) : '—'}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
