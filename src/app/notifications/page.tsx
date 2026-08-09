'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Bell, CheckCircle, Calendar, CreditCard, Star, AlertCircle, MessageSquare, ArrowLeft, Check, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

interface Notification {
  id: string;
  audience: string;
  type: 'booking' | 'payment' | 'feedback' | 'review' | 'system' | 'interview';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const TYPE_ICONS: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  booking: { icon: Calendar, bg: 'bg-blue-50', color: 'text-primary' },
  payment: { icon: CreditCard, bg: 'bg-green-50', color: 'text-success' },
  feedback: { icon: MessageSquare, bg: 'bg-purple-50', color: 'text-purple-600' },
  review: { icon: Star, bg: 'bg-amber-50', color: 'text-accent' },
  system: { icon: AlertCircle, bg: 'bg-sky-50', color: 'text-info' },
  interview: { icon: CheckCircle, bg: 'bg-green-50', color: 'text-success' },
};

const FILTERS = ['All', 'Unread', 'Bookings', 'Payments', 'Feedback', 'Reviews'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [backHref, setBackHref] = useState('/student-dashboard');

  useEffect(() => {
    const load = async () => {
      try {
        const auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
        const role = String(auth.role || '').toLowerCase();
        const audience = role.includes('interviewer') ? 'interviewer' : role.includes('admin') ? 'admin' : 'student';
        setBackHref(audience === 'interviewer' ? '/interviewer-portal' : audience === 'admin' ? '/admin-dashboard' : '/student-dashboard');
        const response = await fetch(`${API_BASE}/notifications?audience=${audience}`, { cache: 'no-store' });
        if (!response.ok) return;
        const body = await response.json();
        setNotifications(body.data || []);
      } catch {
        setNotifications([]);
      }
    };
    load();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const deleteNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Unread') return !n.read;
    if (activeFilter === 'Bookings') return n.type === 'booking' || n.type === 'interview';
    if (activeFilter === 'Payments') return n.type === 'payment';
    if (activeFilter === 'Feedback') return n.type === 'feedback';
    if (activeFilter === 'Reviews') return n.type === 'review';
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={backHref} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2">
              <AppLogo size={28} />
              <h1 className="text-base font-700 text-foreground flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-700 bg-danger text-white">{unreadCount}</span>}
              </h1>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-primary font-600 hover:underline">
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 portal-tabs rounded-xl p-1 mb-6 overflow-x-auto scrollbar-thin">
          {FILTERS.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-lg text-sm font-600 transition-all whitespace-nowrap ${activeFilter === filter ? 'portal-tab-active' : 'portal-tab-inactive'}`}>
              {filter}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell size={48} className="text-muted mx-auto mb-4" />
            <h3 className="font-700 text-foreground mb-2">No notifications</h3>
            <p className="text-muted-foreground text-sm">Flow messages will appear here when bookings, approvals, meeting links, feedback, reviews, and withdrawals move forward.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notification) => {
              const { icon: Icon, bg, color } = TYPE_ICONS[notification.type] || TYPE_ICONS.system;
              return (
                <div key={notification.id} className={`bg-card rounded-xl border shadow-card p-4 transition-all ${!notification.read ? 'border-blue-200 bg-blue-50/20' : 'border-border'}`}>
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={18} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-700 text-foreground">{notification.title}</h3>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && <button onClick={() => markRead(notification.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-success transition-colors" title="Mark as read"><Check size={14} /></button>}
                          <button onClick={() => deleteNotification(notification.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-danger transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                        {notification.actionUrl && notification.actionLabel && (
                          <Link href={notification.actionUrl} onClick={() => markRead(notification.id)} className="text-xs text-primary font-600 hover:underline">
                            {notification.actionLabel} -&gt;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}