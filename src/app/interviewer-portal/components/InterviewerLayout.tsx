'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { LayoutDashboard, Calendar, Inbox, CheckSquare, FileText, Wallet, LogOut, Menu, X, ChevronLeft, ChevronRight, Star, Settings } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';
import { logoutToSignIn } from '@/lib/auth';


interface InterviewerLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/interviewer-portal' },
  { id: 'requests', label: 'Interview Requests', icon: Inbox, href: '/interviewer-portal?tab=requests' },
  { id: 'accepted', label: 'Accepted Interviews', icon: CheckSquare, href: '/interviewer-portal?tab=accepted' },
  { id: 'availability', label: 'Availability', icon: Calendar, href: '/interviewer-portal?tab=availability' },
  { id: 'feedback', label: 'Submit Feedback', icon: FileText, href: '/interviewer-portal?tab=feedback' },
  { id: 'earnings', label: 'Earnings & Wallet', icon: Wallet, href: '/interviewer-portal?tab=earnings' },
  { id: 'reviews', label: 'My Reviews', icon: Star, href: '/interviewer-portal?tab=reviews' },
  { id: 'profile', label: 'Profile', icon: Settings, href: '/interviewer-portal?tab=profile' },
];

export default function InterviewerLayout({ children, activePage }: InterviewerLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: 'Interviewer', designation: 'Interviewer', company: 'InterviewHub' });
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('interviewhub_auth');
      if (!raw) {
        logoutToSignIn();
        return;
      }
      const auth = JSON.parse(raw);
      if (auth.role !== 'INTERVIEWER') {
        logoutToSignIn();
        return;
      }
      setProfile({
        fullName: auth.fullName || auth.email?.split('@')[0] || 'Interviewer',
        designation: auth.designation || 'Interviewer',
        company: auth.company || 'InterviewHub',
      });
    } catch {}
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div>
            <span className="font-bold text-base text-foreground">InterviewHub</span>
            <p className="text-xs text-muted-foreground">Interviewer Portal</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {!collapsed && <p className="section-label px-4 mb-2">Navigation</p>}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
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
                  {item.id === 'requests' && requestCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-danger text-white min-w-[20px] text-center">
                      {requestCount}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.id === 'requests' && requestCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-card-md">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t border-border p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">R</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-foreground truncate">{profile.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.designation} - {profile.company}</p>
            </div>
            <button type="button" onClick={logoutToSignIn} className="text-muted-foreground hover:text-danger transition-colors" title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={logoutToSignIn} className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-sm" title="Sign out" aria-label="Sign out"><LogOut size={16} /></button>
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
                <span className="font-bold text-foreground">Interviewer Portal</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-500 flex-1">{item.label}</span>
                    {item.id === 'requests' && requestCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-danger text-white">{requestCount}</span>}
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
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <Menu size={20} />
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div>
              <h1 className="text-base font-700 text-foreground">Interviewer Portal</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {profile.fullName.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-bg border border-green-200">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-600 text-success">Available</span>
            </div>
            <ThemeToggle />
            <NotificationBell audience="interviewer" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}


