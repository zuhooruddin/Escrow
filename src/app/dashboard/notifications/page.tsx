'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Bell, CheckCheck, FileText, AlertTriangle, CheckCircle2, Clock, Wallet, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { timeAgo, cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  deal_created:     { icon: <FileText size={16} />,      color: 'bg-blue-50 text-blue-500' },
  deal_funded:      { icon: <Wallet size={16} />,        color: 'bg-upwork-green-l text-upwork-green' },
  deal_delivered:   { icon: <Clock size={16} />,         color: 'bg-purple-50 text-purple-500' },
  deal_completed:   { icon: <CheckCircle2 size={16} />,  color: 'bg-upwork-green-l text-upwork-green' },
  deal_auto_approved:{ icon: <CheckCircle2 size={16} />, color: 'bg-upwork-green-l text-upwork-green' },
  dispute_opened:   { icon: <AlertTriangle size={16} />, color: 'bg-red-50 text-red-500' },
  dispute_resolved: { icon: <CheckCheck size={16} />,    color: 'bg-blue-50 text-blue-500' },
  kyc_approved:     { icon: <ShieldCheck size={16} />,   color: 'bg-upwork-green-l text-upwork-green' },
  kyc_rejected:     { icon: <ShieldCheck size={16} />,   color: 'bg-red-50 text-red-500' },
  review_reminder:  { icon: <Clock size={16} />,         color: 'bg-amber-50 text-amber-500' },
  deadline_warning: { icon: <AlertTriangle size={16} />, color: 'bg-amber-50 text-amber-500' },
  default:          { icon: <Bell size={16} />,           color: 'bg-gray-100 text-gray-400' },
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page'],
    queryFn: () => api.get('/notifications?limit=50').then(r => r.data.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/mark-read'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-page'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const notifications = data?.notifications || [];
  const unread = data?.unread || 0;

  return (
    <div className="max-w-2xl animate-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-sub">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-ghost text-sm flex items-center gap-1.5 text-upwork-green"
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="card">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 p-4 border-b border-gray-75 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-75 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card card-body flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-75 rounded-full flex items-center justify-center mb-4">
            <Bell size={28} className="text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-ink mb-1">No notifications yet</h3>
          <p className="text-sm text-gray-400">You'll see updates about your deals here</p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-75">
          {notifications.map((notif: any) => {
            const cfg = TYPE_ICONS[notif.type] || TYPE_ICONS.default;
            return (
              <div
                key={notif._id}
                onClick={() => {
                  if (!notif.isRead) markOneMutation.mutate(notif._id);
                }}
                className={cn(
                  'flex gap-4 px-5 py-4 transition-colors',
                  !notif.isRead ? 'bg-upwork-green-xl/40' : 'hover:bg-gray-50/60',
                  notif.deal && 'cursor-pointer'
                )}
              >
                {/* Icon */}
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', cfg.color)}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn('text-sm leading-snug', !notif.isRead ? 'font-semibold text-ink' : 'font-medium text-gray-700')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-upwork-green flex-shrink-0" />
                      )}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>

                  {notif.deal && (
                    <Link
                      href={`/dashboard/deals/${notif.deal}`}
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-upwork-green font-medium hover:underline mt-1.5"
                    >
                      <FileText size={11} /> View Deal
                    </Link>
                  )}

                  {/* Channel badges */}
                  <div className="flex gap-1.5 mt-2">
                    {notif.channels?.email?.sent && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">✉ Email</span>
                    )}
                    {notif.channels?.sms?.sent && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">📱 SMS</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
