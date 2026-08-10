import React from 'react';
import { UserCheck, CreditCard, Star, BookOpen, XCircle, AlertCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface ActivityItem {
  id: string;
  type: 'approval' | 'payment' | 'review' | 'booking' | 'rejection' | 'complaint';
  title: string;
  subtitle: string;
  time: string;
  amount?: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: 'act-001', type: 'payment', title: 'Payment received', subtitle: 'Nisha Verma - MERN Stack - 30 min', time: '4 min ago', amount: 'Rs. 177' },
  { id: 'act-002', type: 'booking', title: 'New booking request', subtitle: 'Aryan Shah -> Java Full Stack', time: '11 min ago' },
  { id: 'act-003', type: 'review', title: '5-star review submitted', subtitle: 'Priya Sharma rated Ananya K.', time: '18 min ago' },
  { id: 'act-004', type: 'approval', title: 'Interviewer approved', subtitle: 'Suresh Nambiar - TCS - DevOps', time: '32 min ago' },
  { id: 'act-005', type: 'payment', title: 'Payment received', subtitle: 'Rohan Mishra - DSA - 60 min', time: '47 min ago', amount: 'Rs. 354' },
  { id: 'act-006', type: 'complaint', title: 'Complaint filed', subtitle: 'Student reported no-show', time: '1 hr ago' },
  { id: 'act-007', type: 'booking', title: 'Interview completed', subtitle: 'Feedback submitted - React - 45 min', time: '2 hrs ago' },
  { id: 'act-008', type: 'rejection', title: 'Application rejected', subtitle: 'Incomplete documents - Manoj G.', time: '3 hrs ago' },
];

const TYPE_CONFIG = {
  approval: { icon: UserCheck, bg: 'bg-success-bg', color: 'text-success' },
  payment: { icon: CreditCard, bg: 'bg-info-bg', color: 'text-info' },
  review: { icon: Star, bg: 'bg-amber-50', color: 'text-amber-500' },
  booking: { icon: BookOpen, bg: 'bg-blue-50', color: 'text-primary' },
  rejection: { icon: XCircle, bg: 'bg-danger-bg', color: 'text-danger' },
  complaint: { icon: AlertCircle, bg: 'bg-warning-bg', color: 'text-warning' },
};

export default function RecentActivity() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-base font-700 text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Platform events - live</p>
        </div>
        <div className="pulse-dot" />
      </div>

      <div className="divide-y divide-border max-h-[480px] overflow-y-auto scrollbar-thin">
        {ACTIVITIES.map((activity) => {
          const config = TYPE_CONFIG[activity.type];
          const Icon = config.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors">
              <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={15} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-600 text-foreground leading-snug">{activity.title}</p>
                  {activity.amount && (
                    <span className="text-xs font-700 text-success tabular-nums flex-shrink-0">{activity.amount}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.subtitle}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border bg-secondary">
        <button className="text-xs text-primary font-600 hover:underline w-full text-center">
          View all activity log
        </button>
      </div>
    </div>
  );
}