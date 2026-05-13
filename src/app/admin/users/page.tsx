'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, ChevronRight, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { useAdminApiEnabled } from '@/lib/useAuthHydrated';
import { formatDate, getInitials, timeAgo, cn } from '@/lib/utils';
import Navbar from '@/components/layout/Navbar';

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

  const kycBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:   'bg-gray-100 text-gray-500',
      submitted: 'bg-amber-50 text-amber-600',
      approved:  'bg-upwork-green-l text-upwork-green',
      rejected:  'bg-red-50 text-red-600',
    };
    return map[status] || map.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">User Management</h1>
            <p className="section-sub">{data?.total || 0} registered users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card card-sm flex gap-3 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, email, phone…"
              className="input pl-9 py-2 text-sm"
            />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input py-2 text-sm w-auto">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-upwork">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>KYC</th>
                  <th>Deals</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : users.map((u: any) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar w-8 h-8 text-xs flex-shrink-0">
                          <span>{getInitials(u.fullName)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-500 font-mono">{u.phone}</td>
                    <td><span className="badge bg-gray-100 text-gray-600 capitalize">{u.role}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={cn('badge text-xs capitalize', kycBadge(u.kyc?.status))}>
                          {u.kyc?.status}
                        </span>
                        {u.kyc?.status === 'submitted' && (
                          <div className="flex gap-1">
                            <button onClick={() => kycMutation.mutate({ userId: u._id, action: 'approve' })}
                              className="text-xs text-upwork-green hover:underline font-medium">Approve</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => kycMutation.mutate({ userId: u._id, action: 'reject' })}
                              className="text-xs text-red-500 hover:underline font-medium">Reject</button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="text-gray-600">{u.stats?.totalDealsAsBuyer || 0} as buyer</span>
                        <br />
                        <span className="text-gray-400">{u.stats?.totalDealsAsSeller || 0} as seller</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={cn('badge text-xs', u.isSuspended ? 'bg-red-50 text-red-600' : 'bg-upwork-green-l text-upwork-green')}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelected(u)} className="text-gray-400 hover:text-ink">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-75">
              <p className="text-sm text-gray-400">Page {page} of {data.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost btn-sm px-3">←</button>
                <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page === data.pages} className="btn-ghost btn-sm px-3">→</button>
              </div>
            </div>
          )}
        </div>

        {/* User detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-modal p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 animate-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="avatar w-12 h-12 text-base"><span>{getInitials(selected.fullName)}</span></div>
                <div>
                  <h3 className="text-base font-semibold text-ink">{selected.fullName}</h3>
                  <p className="text-sm text-gray-400">{selected.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-5 text-sm">
                {[
                  ['Phone', selected.phone],
                  ['Role', selected.role],
                  ['KYC Status', selected.kyc?.status],
                  ['Joined', formatDate(selected.createdAt)],
                  ['Total Deals (Buyer)', selected.stats?.totalDealsAsBuyer],
                  ['Total Deals (Seller)', selected.stats?.totalDealsAsSeller],
                  ['Status', selected.isSuspended ? 'Suspended' : 'Active'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-gray-75">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-ink capitalize">{String(v)}</span>
                  </div>
                ))}
              </div>

              {!selected.isSuspended && (
                <div className="mb-4">
                  <label className="label text-sm">Suspension Reason</label>
                  <input value={suspendReason} onChange={e => setSuspendReason(e.target.value)}
                    className="input py-2 text-sm" placeholder="Reason for suspension…" />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setSelected(null); setSuspendReason(''); }} className="btn-ghost flex-1">
                  Close
                </button>
                <button
                  onClick={() => suspendMutation.mutate()}
                  disabled={suspendMutation.isPending || (!selected.isSuspended && !suspendReason)}
                  className={cn('flex-1 btn', selected.isSuspended ? 'btn-secondary' : 'btn-danger')}
                >
                  {selected.isSuspended ? (
                    <><CheckCircle2 size={14} /> Reinstate</>
                  ) : (
                    <><ShieldOff size={14} /> Suspend</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
