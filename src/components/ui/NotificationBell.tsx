'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
};

interface NotificationBellProps {
  audience: 'student' | 'interviewer' | 'admin';
}

export default function NotificationBell({ audience }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications?audience=${audience}`, { cache: 'no-store' });
      if (!response.ok) return;
      const body = await response.json();
      setItems(body.data || []);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(timer);
  }, [audience]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-card-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="text-sm font-700 text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
            </div>
            <button type="button" className="text-xs text-primary hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin divide-y divide-border">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</div>
            ) : items.slice(0, 6).map((item) => (
              <div key={item.id} className="px-4 py-3 hover:bg-secondary/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <Bell size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-700 text-foreground truncate">{item.title}</p>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{item.createdAt || 'now'}</span>
                      {item.actionUrl && (
                        <Link href={item.actionUrl} onClick={() => setOpen(false)} className="text-xs text-primary font-600 hover:underline">
                          {item.actionLabel || 'Open'}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Check size={13} />
                    <Trash2 size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}