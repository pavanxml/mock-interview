'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import NotificationBell from '@/components/ui/NotificationBell';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { logoutToSignIn } from '@/lib/auth';
import {
    LayoutDashboard, Users, Briefcase, BookOpen, CreditCard, Star,
    Settings, ChevronLeft, ChevronRight, Search, LogOut,
    TrendingUp, Wallet, AlertCircle, MessageSquare, Shield, Menu, X,
    CheckSquare, BarChart2
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface AdminLayoutProps {
    children: React.ReactNode;
    activePage: string;
}

const API_BASE = '/api/v1';

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin-dashboard', badge: null },
        ],
    },
    {
        label: 'Users',
        items: [
            { id: 'interviewers', label: 'Interviewers', icon: Briefcase, href: '/admin-dashboard?tab=interviewers', badge: '7' },
            { id: 'students', label: 'Students', icon: Users, href: '/admin-dashboard?tab=students', badge: null },
        ],
    },
    {
        label: 'Operations',
        items: [
            { id: 'bookings', label: 'Bookings', icon: BookOpen, href: '/admin-dashboard?tab=bookings', badge: '3' },
            { id: 'technologies', label: 'Technologies', icon: BarChart2, href: '/admin-dashboard?tab=technologies', badge: null },
            { id: 'reviews', label: 'Reviews', icon: Star, href: '/admin-dashboard?tab=reviews', badge: '12' },
            { id: 'complaints', label: 'Complaints', icon: MessageSquare, href: '/admin-dashboard?tab=complaints', badge: '2' },
        ],
    },
    {
        label: 'Finance',
        items: [
            { id: 'payments', label: 'Payments', icon: CreditCard, href: '/admin-dashboard?tab=payments', badge: null },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet, href: '/admin-dashboard?tab=withdrawals', badge: '5' },
            { id: 'revenue', label: 'Revenue', icon: TrendingUp, href: '/admin-dashboard?tab=revenue', badge: null },
        ],
    },
    {
        label: 'Platform',
        items: [
            { id: 'approvals', label: 'Approvals', icon: CheckSquare, href: '/admin-dashboard?tab=approvals', badge: '7' },
            { id: 'security', label: 'Audit Logs', icon: Shield, href: '/admin-dashboard?tab=security', badge: null },
            { id: 'settings', label: 'Settings', icon: Settings, href: '/admin-dashboard?tab=settings', badge: null },
        ],
    },
];

export default function AdminLayout({ children, activePage }: AdminLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [pendingApprovals, setPendingApprovals] = useState<number | null>(null);

    useEffect(() => {
        let active = true;
        try {
            const auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
            if (auth.role !== 'ADMIN') {
                logoutToSignIn();
                return () => {
                    active = false;
                };
            }
        } catch {
            logoutToSignIn();
            return () => {
                active = false;
            };
        }
        const loadCounts = async () => {
            try {
                const response = await fetch(`${API_BASE}/admin/overview`, { cache: 'no-store' });
                if (!response.ok) return;
                const body = await response.json();
                if (active) setPendingApprovals(body.data?.metrics?.pendingApprovals ?? null);
            } catch {
                if (active) setPendingApprovals(null);
            }
        };
        loadCounts();
        const timer = window.setInterval(loadCounts, 15000);
        return () => {
            active = false;
            window.clearInterval(timer);
        };
    }, []);

    const badgeFor = (item: { id: string; badge: string | null }) => {
        if ((item.id === 'interviewers' || item.id === 'approvals') && pendingApprovals !== null) {
            return pendingApprovals > 0 ? String(pendingApprovals) : null;
        }
        return item.badge;
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
                <AppLogo size={32} />
                {!collapsed && (
                    <div>
                        <span className="font-bold text-base text-foreground">InterviewHub</span>
                        <p className="text-xs text-muted-foreground font-500">Admin Console</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                {NAV_GROUPS.map((group) => (
                    <div key={`nav-group-${group.label}`} className="mb-5">
                        {!collapsed && (
                            <p className="section-label px-4 mb-2">{group.label}</p>
                        )}
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activePage === item.id;
                            const badge = badgeFor(item);
                            return (
                                <Link
                                    key={`nav-${item.id}`}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 group relative ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    {!collapsed && (
                                        <>
                                            <span className="text-sm font-500 flex-1">{item.label}</span>
                                            {badge && (
                                                <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-danger text-white min-w-[20px] text-center tabular-nums">
                                                    {badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {collapsed && badge && (
                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
                                    )}
                                    {collapsed && (
                                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-card-md">
                                            {item.label}
                                            {badge && ` (${badge})`}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom user section */}
            <div className={`border-t border-border p-4 ${collapsed ? 'flex justify-center' : ''}`}>
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-600 text-foreground truncate">Arjun Mehta</p>
                            <p className="text-xs text-muted-foreground truncate">Super Admin</p>
                        </div>
                        <button type="button" onClick={logoutToSignIn} className="text-muted-foreground hover:text-danger transition-colors" title="Sign out" aria-label="Sign out">
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <button type="button" onClick={logoutToSignIn} className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm" title="Sign out" aria-label="Sign out">
                        <LogOut size={16} />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col glass-panel border-r border-border flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="w-64 glass-panel border-r border-border flex flex-col h-full shadow-card-lg">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <AppLogo size={28} />
                                <span className="font-bold text-foreground">Admin Console</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                            {NAV_GROUPS.map((group) => (
                                <div key={`mob-nav-group-${group.label}`} className="mb-5">
                                    <p className="section-label px-4 mb-2">{group.label}</p>
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activePage === item.id;
                                        const badge = badgeFor(item);
                                        return (
                                            <Link
                                                key={`mob-nav-${item.id}`}
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-150 mb-0.5 ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                <span className="text-sm font-500 flex-1">{item.label}</span>
                                                {badge && (
                                                    <span className="px-1.5 py-0.5 rounded-full text-xs font-700 bg-danger text-white">{badge}</span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
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
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>

                        <div className="relative hidden sm:block">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search students, interviewers, bookings..."
                                className="input-field pl-9 w-64 xl:w-80 h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live indicator */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success-bg border border-green-200">
                            <span className="pulse-dot" />
                            <span className="text-xs font-600 text-success">Live - 13 Jul 2026</span>
                        </div>

                        {/* Notifications */}
                        <ThemeToggle />
                        <NotificationBell audience="admin" />

                        {/* Alert */}
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-bg border border-red-200 text-danger text-xs font-600 hover:bg-danger hover:text-white transition-colors">
                            <AlertCircle size={14} />
                            {pendingApprovals ?? 0} Pending Approvals
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin bg-transparent">
                    <div className="w-full p-4 sm:p-5 lg:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


