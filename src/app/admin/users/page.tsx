'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, ChevronRight, Users, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatDate, getInitials, timeAgo, cn } from '@/lib/utils';

export default function AdminUsersPage() {
  const adminApiEnabled = useAdminApiEnabled();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, status, page],
    queryFn: () => api.get('/admin/users', { params: { search: search || undefined, status: status || undefined, page, limit: 20 } }).then(r => r.data.data),
    enabled: adminApiEnabled,
  });

  const suspendMutation = useMutation({
    mutationFn: () => api.post('/admin/users/toggle-suspend', { userId: selected._id, reason: suspendReason }),
    onSuccess: () => {
      toast.success(`User ${selected.isSuspended ? 'reinstated' : 'suspended'}`);
      setSelected(null);
      setSuspendReason('');
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const kycMutation = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: string }) =>
      api.post('/admin/kyc/review', { userId, action }),
    onSuccess: (_, { action }) => {
      toast.success(`KYC ${action}d`);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: e => toast.error(getErrorMessage(e)),
  });

  const users = data?.users || [];

  const kycColors: Record<string, string> = {
    pending:   'bg-gray-100 text-gray-500',
    submitted: 'bg-amber-50 text-amber-600 border border-amber-200',
    approved:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected:  'bg-red-50 text-red-600 border border-red-200',
  };

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.total || 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-all"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User','Phone','Role','KYC','Deals','Joined','Status',''].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-lg animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Users size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : users.map((u: any) => (
                <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {getInitials(u.fullName)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-mono">{u.phone}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full capitalize">{u.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full capitalize', kycColors[u.kyc?.status] || kycColors.pending)}>
                        {u.kyc?.status}
                      </span>
                      {u.kyc?.status === 'submitted' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => kycMutation.mutate({ userId: u._id, action: 'approve' })}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">Approve</button>
                          <span className="text-gray-300">·</span>
                          <button onClick={() => kycMutation.mutate({ userId: u._id, action: 'reject' })}
                            className="text-xs text-red-500 hover:text-red-600 font-semibold hover:underline">Reject</button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-gray-700">{u.stats?.totalDealsAsBuyer || 0} buyer</p>
                    <p className="text-xs text-gray-400">{u.stats?.totalDealsAsSeller || 0} seller</p>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full',
                      u.isSuspended ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    )}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(u)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500">Page {page} of {data.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">← Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">User Details</h3>
              <button onClick={() => { setSelected(null); setSuspendReason(''); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 text-base font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(selected.fullName)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{selected.fullName}</h4>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5">
                {[
                  ['Phone', selected.phone],
                  ['Role', selected.role],
                  ['KYC Status', selected.kyc?.status],
                  ['Joined', formatDate(selected.createdAt)],
                  ['Deals as Buyer', selected.stats?.totalDealsAsBuyer],
                  ['Deals as Seller', selected.stats?.totalDealsAsSeller],
                  ['Account Status', selected.isSuspended ? 'Suspended' : 'Active'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">{k}</span>
                    <span className="text-xs font-semibold text-gray-900 capitalize">{String(v ?? '—')}</span>
                  </div>
                ))}
              </div>

              {!selected.isSuspended && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Suspension Reason</label>
                  <input
                    value={suspendReason}
                    onChange={e => setSuspendReason(e.target.value)}
                    className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 transition-all"
                    placeholder="Reason for suspension…"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setSelected(null); setSuspendReason(''); }}
                  className="flex-1 h-10 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Close
                </button>
                <button
                  onClick={() => suspendMutation.mutate()}
                  disabled={suspendMutation.isPending || (!selected.isSuspended && !suspendReason)}
                  className={cn(
                    'flex-1 h-10 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    selected.isSuspended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  )}
                >
                  {selected.isSuspended
                    ? <><CheckCircle2 size={14} /> Reinstate</>
                    : <><ShieldOff size={14} /> Suspend</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
