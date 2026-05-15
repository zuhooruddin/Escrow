'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileText, AlertTriangle, Building2,
  ShieldCheck, Users, Wallet, BarChart3, Settings,
  Bell, ChevronDown, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';
import { getInitials, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const NAV = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/deals',        icon: FileText,        label: 'All Deals' },
  { href: '/admin/disputes',     icon: AlertTriangle,   label: 'Disputes' },
  { href: '/admin/ibft-pending', icon: Building2,       label: 'IBFT Verifications' },
  { href: '/admin/kyc-queue',    icon: ShieldCheck,     label: 'KYC Queue' },
  { href: '/admin/users',        icon: Users,           label: 'Users' },
  { href: '/admin/revenue',      icon: Wallet,          label: 'Revenue' },
  { href: '/admin/reports',      icon: BarChart3,       label: 'Reports' },
  { href: '/admin/settings',     icon: Settings,        label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const authHydrated = useAuthHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?limit=1').then(r => r.data.data.unread),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unread = notifData || 0;

  useEffect(() => {
    if (!authHydrated || isLoading) return;
    if (!isAuthenticated) router.push('/auth/login');
    if (isAuthenticated && user?.role !== 'admin') router.push('/dashboard');
  }, [authHydrated, isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!authHydrated || !isAuthenticated) return null;

  const initials = getInitials(user?.fullName || 'EA');

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside className={cn(
          'fixed top-0 left-0 h-full w-56 bg-[#0d2a1f] flex flex-col z-50 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Escrow<span className="text-emerald-400">PK</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {NAV.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href ||
                (href !== '/admin' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-white/10 p-3">
            <button
              onClick={() => setSidebarProfileOpen(p => !p)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  : initials
                }
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
              </div>
              <ChevronDown size={13} className={cn('text-white/40 transition-transform', sidebarProfileOpen && 'rotate-180')} />
            </button>

            {sidebarProfileOpen && (
              <div className="mt-1 bg-[#1a3d2b] border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => { setSidebarProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </aside>
      </>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-56">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-3">
            {/* Live monitoring */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live monitoring
            </div>

            {/* Bell */}
            <Link href="/dashboard/notifications" className="relative p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            {/* Avatar + dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-1.5 hover:bg-gray-100 rounded-lg px-1.5 py-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : initials
                  }
                </div>
                <ChevronDown size={14} className={cn('text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-50">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user?.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
