'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../../styles/globals.css';

import {
  LayoutDashboard, FileText, PlusCircle, Bell, User,
  Wallet, MessageSquare, ShieldCheck, TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard',                icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/dashboard/deals',          icon: <FileText size={18} />,        label: 'My Deals' },
  { href: '/dashboard/deals/create',   icon: <PlusCircle size={18} />,      label: 'New Deal' },
  { href: '/dashboard/earnings',       icon: <Wallet size={18} />,          label: 'Earnings' },
  { href: '/dashboard/notifications',  icon: <Bell size={18} />,            label: 'Notifications' },
  { href: '/dashboard/profile',        icon: <User size={18} />,            label: 'Profile & KYC' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const authHydrated = useAuthHydrated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authHydrated || isLoading) return;
    if (!isAuthenticated) router.push('/auth/login');
  }, [authHydrated, isAuthenticated, isLoading, router]);

  if (!authHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <div className="page-container py-8">
        <div className="flex gap-8">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <nav className="space-y-0.5 sticky top-24">
              {sidebarLinks.map(link => {
                const isActive = pathname === link.href ||
                  (link.href !== '/dashboard' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'sidebar-link',
                      isActive && 'sidebar-link-active font-semibold'
                    )}
                  >
                    <span className={cn(isActive ? 'text-upwork-green' : 'text-gray-400')}>
                      {link.icon}
                    </span>
                    {link.label}
                    {link.href === '/dashboard/deals/create' && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-upwork-green" />
                    )}
                  </Link>
                );
              })}

              {/* KYC Banner */}
              <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">Verify Identity</span>
                </div>
                <p className="text-xs text-amber-600 mb-2">Complete KYC to unlock all features</p>
                <Link href="/dashboard/profile" className="text-xs text-upwork-green font-semibold hover:underline">
                  Complete KYC →
                </Link>
              </div>
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
