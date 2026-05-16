'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Bell, ChevronDown, LayoutDashboard, FileText, Plus,
  LogOut, Settings, User, Shield, Menu, X, Wallet,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getInitials, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications?limit=1').then(r => r.data.data.unread),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const unread = notifData || 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = user?.role === 'admin';

  const navLinks = isAdmin ? [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/deals', label: 'All Deals' },
    { href: '/admin/disputes', label: 'Disputes' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/revenue', label: 'Revenue' },
  ] : [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/deals', label: 'My Deals' },
    { href: '/dashboard/earnings', label: 'Earnings' },
  ];

  return (
    <header className="sticky top-0 z-sticky bg-white border-b border-gray-100 shadow-xs">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* ── LOGO ── */}
          <Link href={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-1">
            <img src="/logo.webp" alt="Rakhwali PK" className="h-11 w-auto object-contain" style={{mixBlendMode:'multiply'}} />
          </Link>

          {/* ── DESKTOP NAV ── */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-upwork-green bg-upwork-green-l'
                      : 'text-gray-600 hover:text-ink hover:bg-gray-75'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── RIGHT SIDE ── */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Create Deal Button */}
                {!isAdmin && (
                  <Link href="/dashboard/deals/create" className="hidden sm:flex btn-primary btn-md gap-2 text-sm px-4 py-2">
                    <Plus size={16} />
                    New Deal
                  </Link>
                )}

                {/* Notifications */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 text-gray-500 hover:text-ink hover:bg-gray-75 rounded-md transition-colors"
                >
                  <Bell size={20} />
                  {unread > 0 && (
                    <span className="notif-dot">{unread > 9 ? '9+' : unread}</span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-75 transition-colors"
                  >
                    <div className="avatar w-8 h-8 text-sm">
                      {user?.avatar
                        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                        : <span>{getInitials(user?.fullName || 'U')}</span>
                      }
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={cn('text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-150 py-1 animate-in z-dropdown">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-75">
                        <p className="text-sm font-semibold text-ink truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {user?.kyc?.status !== 'approved' && (
                          <Link
                            href="/dashboard/profile"
                            className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"
                            onClick={() => setProfileOpen(false)}
                          >
                            ⚠ KYC not verified
                          </Link>
                        )}
                      </div>
                      <div className="py-1">
                        <DropItem href="/dashboard/profile" icon={<User size={15} />} label="Profile & Settings" onClick={() => setProfileOpen(false)} />
                        <DropItem href="/dashboard/earnings" icon={<Wallet size={15} />} label="Earnings & Payouts" onClick={() => setProfileOpen(false)} />
                        {isAdmin && (
                          <DropItem href="/admin" icon={<Shield size={15} />} label="Admin Panel" onClick={() => setProfileOpen(false)} />
                        )}
                      </div>
                      <div className="border-t border-gray-75 py-1">
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile menu */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:bg-gray-75 rounded-md"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="btn-ghost btn-md text-sm px-4 py-2">Log in</Link>
                <Link href="/auth/register" className="btn-primary btn-md text-sm px-4 py-2">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE NAV ── */}
        {menuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-100 py-2 animate-in">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                  pathname === link.href ? 'text-upwork-green bg-upwork-green-l' : 'text-gray-700 hover:bg-gray-75'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2 border-t border-gray-100 mt-2">
              <Link href="/dashboard/deals/create" onClick={() => setMenuOpen(false)} className="btn-primary w-full justify-center">
                <Plus size={16} /> New Deal
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function DropItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-75 hover:text-ink transition-colors">
      <span className="text-gray-400">{icon}</span>
      {label}
    </Link>
  );
}
