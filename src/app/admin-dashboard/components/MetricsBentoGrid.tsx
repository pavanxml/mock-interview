import React from 'react';
import {
  Users, Briefcase, Clock, CalendarCheck, CheckCircle2,
  TrendingUp, Wallet, Star, AlertTriangle, ArrowUp, ArrowDown
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const METRICS = [
  {
    id: 'metric-students',
    label: 'Total Students',
    value: '18,472',
    sub: '+284 this week',
    trend: 'up',
    trendPct: '+3.2%',
    icon: Users,
    iconBg: 'bg-blue-100',
    iconColor: 'text-primary',
    size: 'normal',
    state: 'positive',
  },
  {
    id: 'metric-interviewers',
    label: 'Active Interviewers',
    value: '2,418',
    sub: '94 pending approval',
    trend: 'up',
    trendPct: '+12',
    icon: Briefcase,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    size: 'normal',
    state: 'positive',
  },
  {
    id: 'metric-pending',
    label: 'Pending Approvals',
    value: '7',
    sub: 'Avg wait: 18 hrs',
    trend: 'up',
    trendPct: '+3',
    icon: Clock,
    iconBg: 'bg-danger-bg',
    iconColor: 'text-danger',
    size: 'normal',
    state: 'alert',
  },
  {
    id: 'metric-today',
    label: "Today\'s Interviews",
    value: '43',
    sub: '12 in progress now',
    trend: 'up',
    trendPct: '+8 vs yesterday',
    icon: CalendarCheck,
    iconBg: 'bg-success-bg',
    iconColor: 'text-success',
    size: 'hero',
    state: 'positive',
  },
  {
    id: 'metric-completed',
    label: 'Completed (July)',
    value: '1,284',
    sub: '94.2% completion rate',
    trend: 'up',
    trendPct: '+18.4%',
    icon: CheckCircle2,
    iconBg: 'bg-success-bg',
    iconColor: 'text-success',
    size: 'normal',
    state: 'positive',
  },
  {
    id: 'metric-revenue',
    label: 'Total Revenue (July)',
    value: 'Rs. 3,84,200',
    sub: 'Rs. 12,380 today',
    trend: 'up',
    trendPct: '+22.1% MoM',
    icon: TrendingUp,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    size: 'normal',
    state: 'positive',
  },
  {
    id: 'metric-commission',
    label: 'Commission Earned',
    value: 'Rs. 38,420',
    sub: '10% of Rs. 3,84,200',
    trend: 'up',
    trendPct: '+22.1%',
    icon: TrendingUp,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    size: 'normal',
    state: 'positive',
  },
  {
    id: 'metric-withdrawals',
    label: 'Withdrawal Requests',
    value: '5',
    sub: 'Rs. 42,800 total pending',
    trend: 'neutral',
    trendPct: 'Needs action',
    icon: Wallet,
    iconBg: 'bg-warning-bg',
    iconColor: 'text-warning',
    size: 'normal',
    state: 'warning',
  },
  {
    id: 'metric-rating',
    label: 'Avg Interviewer Rating',
    value: '4.78',
    sub: 'Based on 6,241 reviews',
    trend: 'down',
    trendPct: '-0.04 vs last month',
    icon: Star,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    size: 'normal',
    state: 'neutral',
  },
];

export default function MetricsBentoGrid() {
  // Grid plan: 9 cards -> grid-cols-4
  // Row 1: hero (spans 2 cols) + 3 normal = 4 cols total -> 5 cards
  // Row 2: 4 normal cards
  // hero = metric-today (index 3)

  const heroMetric = METRICS.find((m) => m.size === 'hero')!;
  const normalMetrics = METRICS.filter((m) => m.size !== 'hero');
  // Row 1: first 3 normals before hero + hero
  const row1Left = normalMetrics.slice(0, 3);
  // Row 2: remaining 5 normals -> but we have 8 normal, so 8-3=5 -> put 4 in row2, 1 in row3 combined with something
  // Actually: 9 cards total. hero spans 2 cols. So row1 = hero(2) + 2 normal = 4 cols. row2 = 4 normal. row3 = 3 normal -> last spans 2 cols to fill
  const row1Normals = normalMetrics.slice(0, 2);
  const row2Normals = normalMetrics.slice(2, 6);
  const row3Normals = normalMetrics.slice(6, 8);

  return (
    <div className="space-y-4">
      {/* Row 1: Hero + 2 normal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <MetricCard metric={heroMetric} spanTwo />
        {row1Normals.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Row 2: 4 normal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {row2Normals.map((m) => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Row 3: 2 normal, last spans 2 cols */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        <MetricCard metric={row3Normals[0]} />
        <MetricCard metric={row3Normals[1]} spanTwo />
      </div>
    </div>
  );
}

function MetricCard({ metric, spanTwo = false }: { metric: typeof METRICS[0]; spanTwo?: boolean }) {
  const Icon = metric.icon;

  const stateStyles = {
    positive: 'bg-card border-border',
    alert: 'bg-danger-bg border-red-200',
    warning: 'bg-warning-bg border-amber-200',
    neutral: 'bg-card border-border',
  };

  return (
    <div
      className={`rounded-xl border p-5 card-hover shadow-card ${stateStyles[metric.state as keyof typeof stateStyles]} ${
        spanTwo ? 'lg:col-span-2' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${metric.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={metric.iconColor} />
        </div>
        {metric.state === 'alert' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-danger-bg border border-red-200">
            <AlertTriangle size={11} className="text-danger" />
            <span className="text-xs font-600 text-danger">Action needed</span>
          </div>
        )}
        {metric.state === 'warning' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning-bg border border-amber-200">
            <AlertTriangle size={11} className="text-warning" />
            <span className="text-xs font-600 text-warning">Pending</span>
          </div>
        )}
      </div>

      <p className="section-label mb-1">{metric.label}</p>
      <p className={`font-700 tabular-nums mb-1.5 ${spanTwo ? 'text-4xl' : 'text-2xl'} text-foreground`}>
        {metric.value}
      </p>

      <div className="flex items-center gap-1.5">
        {metric.trend === 'up' && <ArrowUp size={12} className="text-success" />}
        {metric.trend === 'down' && <ArrowDown size={12} className="text-danger" />}
        <span className={`text-xs font-500 ${
          metric.trend === 'up' ? 'text-success' :
          metric.trend === 'down'? 'text-danger' : 'text-muted-foreground'
        }`}>
          {metric.trendPct}
        </span>
        <span className="text-xs text-muted-foreground">- {metric.sub}</span>
      </div>
    </div>
  );
}