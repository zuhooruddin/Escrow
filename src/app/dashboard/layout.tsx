'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../../styles/globals.css';

import {
  LayoutDashboard, FileText, PlusCircle, Bell, User,
  Wallet, ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { useAuthHydrated } from '@/lib/useAuthHydrated';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/deals',          icon: FileText,         label: 'My Deals' },
  { href: '/dashboard/deals/create',   icon: PlusCircle,       label: 'New Deal' },
  { href: '/dashboard/earnings',       icon: Wallet,           label: 'Earnings' },
  { href: '/dashboard/notifications',  icon: Bell,             label: 'Notifications' },
  { href: '/dashboard/profile',        icon: User,             label: 'Profile & KYC' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const authHydrated = useAuthHydrated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authHydrated || isLoading) return;
    if (!isAuthenticated) router.push('/auth/login');
  }, [authHydrated, isAuthenticated, isLoading, router]);

  if (!authHydrated || !isAuthenticated) return null;

  const kycPending = user?.kyc?.status !== 'approved';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-7">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
            <nav className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="py-2">
                {sidebarLinks.map(link => {
                  const isActive = pathname === link.href ||
                    (link.href !== '/dashboard' && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 relative',
                        isActive
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-600 rounded-r-full" />
                      )}
                      <Icon
                        size={17}
                        className={isActive ? 'text-emerald-600' : 'text-gray-400'}
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* KYC Banner */}
              {kycPending && (
                <div className="mx-3 mb-3 p-3.5 bg-emerald-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={14} className="text-emerald-200" />
                    <span className="text-xs font-semibold text-white">Complete Your KYC</span>
                  </div>
                  <p className="text-xs text-emerald-200 mb-2.5 leading-relaxed">
                    Verify your identity to unlock all features and ensure secure transactions.
                  </p>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg w-full justify-center"
                  >
                    Complete KYC →
                  </Link>
                </div>
              )}
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
