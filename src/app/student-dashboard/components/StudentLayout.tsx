'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LayoutDashboard, Calendar, FileText, CreditCard, User, LogOut, Menu, X, ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react';
import { logoutToSignIn } from '@/lib/auth';

interface StudentLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

const API_BASE = '/api/v1';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/student-dashboard' },
  { id: 'upcoming', label: 'Upcoming Interviews', icon: Calendar, href: '/student-dashboard?tab=upcoming', badge: 'dynamic' },
  { id: 'history', label: 'Booking History', icon: BookOpen, href: '/student-dashboard?tab=history' },
  { id: 'feedback', label: 'Feedback Reports', icon: FileText, href: '/student-dashboard?tab=feedback' },
  { id: 'payments', label: 'Payment History', icon: CreditCard, href: '/student-dashboard?tab=payments' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/student-dashboard?tab=reviews' },
  { id: 'profile', label: 'Profile', icon: User, href: '/student-dashboard?tab=profile' },
];

export default function StudentLayout({ children, activePage }: StudentLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: 'Student', college: 'Student Portal', email: '' });
  const [upcomingCount, setUpcomingCount] = useState(0);
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  const currentActivePage = currentTab || activePage;

  useEffect(() => {
    let auth: any = {};
    try {
      auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
    } catch {}

    const nextProfile = {
      fullName: auth.fullName || auth.email?.split('@')[0] || 'Student',
      college: auth.company || auth.college || 'Student Portal',
      email: auth.email || '',
    };
    setProfile(nextProfile);

    const loadCount = async () => {
      try {
        const params = nextProfile.email ? `?email=${encodeURIComponent(nextProfile.email)}` : '';
        const response = await fetch(`${API_BASE}/bookings/student/overview${params}`, { cache: 'no-store' });
        if (!response.ok) return;
        const body = await response.json();
        setUpcomingCount((body.data?.upcoming || []).length);
      } catch {}
    };
    loadCount();
  }, []);

  const badgeFor = (badge?: string) => {
    if (badge !== 'dynamic') return badge;
    return upcomingCount > 0 ? String(upcomingCount) : null;
  };

  const initial = profile.fullName.trim().charAt(0).toUpperCase() || 'S';
  const firstName = profile.fullName.split(' ')[0] || 'Student';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div>
            <span className="font-bold text-base text-foreground">InterviewHub</span>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div className="mb-2">
          {!collapsed && <p className="section-label px-4 mb-2">Navigation</p>}
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'dashboard' ? !currentTab && currentActivePage === 'dashboard' : currentActivePage === item.id;
            const badge = badgeFor(item.badge);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 group relative ${
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-500 flex-1">{item.label}</span>
                    {badge && (
                      <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-primary text-white min-w-[20px] text-center">
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && badge && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-card-md">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-4">
          {!collapsed && <p className="section-label px-4 mb-2">Quick Actions</p>}
          <Link
            href="/student-interview-booking"
            className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 bg-primary text-white hover:bg-blue-800 ${collapsed ? 'justify-center' : ''}`}
          >
            <BookOpen size={18} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-600">Book Interview</span>}
          </Link>
        </div>
      </nav>

      <div className={`border-t border-border p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-foreground truncate">{profile.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.college}</p>
            </div>
            <button type="button" onClick={logoutToSignIn} className="text-muted-foreground hover:text-danger transition-colors" title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={logoutToSignIn} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm" title="Sign out" aria-label="Sign out">
            {initial}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className={`hidden lg:flex flex-col glass-panel border-r border-border flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 glass-panel border-r border-border flex flex-col h-full shadow-card-lg">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AppLogo size={28} />
                <span className="font-bold text-foreground">Student Portal</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'dashboard' ? !currentTab && currentActivePage === 'dashboard' : currentActivePage === item.id;
                const badge = badgeFor(item.badge);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-500 flex-1">{item.label}</span>
                    {badge && <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-primary text-white">{badge}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="glass-panel border-b border-border h-16 flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div>
              <h1 className="text-base font-700 text-foreground">Student Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell audience="student" />
            <Link href="/student-interview-booking" className="btn-primary text-sm px-4 py-2 hidden sm:flex">
              + Book Interview
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
