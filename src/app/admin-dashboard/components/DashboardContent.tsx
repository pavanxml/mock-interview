import React from 'react';
import MetricsBentoGrid from './MetricsBentoGrid';
import PendingApprovalsTable from './PendingApprovals';
import WithdrawalQueue from './WithdrawalQueue';
import RevenueChart from './RevenueChart';
import BookingsTechChart from './BookingsTech';
import TopInterviewers from './TopInterviewers';
import RecentActivity from './RecentActivity';

export default function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            InterviewHub operations overview — Sunday, 13 July 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Last updated:</span>
          <span className="text-xs font-600 text-foreground font-mono-data">04:06 AM IST</span>
          <div className="pulse-dot" />
        </div>
      </div>

      {/* KPI Bento Grid */}
      <MetricsBentoGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <div className="xl:col-span-1">
          <BookingsTechChart />
        </div>
      </div>

      {/* Operations row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PendingApprovalsTable />
        </div>
        <div className="xl:col-span-1">
          <WithdrawalQueue />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TopInterviewers />
        </div>
        <div className="xl:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}