'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const REVENUE_DATA = [
  { month: 'Jan', revenue: 142000, commission: 14200, bookings: 474 },
  { month: 'Feb', revenue: 168000, commission: 16800, bookings: 560 },
  { month: 'Mar', revenue: 195000, commission: 19500, bookings: 650 },
  { month: 'Apr', revenue: 178000, commission: 17800, bookings: 593 },
  { month: 'May', revenue: 224000, commission: 22400, bookings: 747 },
  { month: 'Jun', revenue: 251000, commission: 25100, bookings: 837 },
  { month: 'Jul', revenue: 384200, commission: 38420, bookings: 1284 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-card-md">
      <p className="text-sm font-700 text-foreground mb-2">{label} 2026</p>
      {payload.map((entry, i) => (
        <div key={`tooltip-entry-${i}`} className="flex items-center justify-between gap-6 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="text-xs font-700 text-foreground tabular-nums">
            Rs. {entry.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-700 text-foreground">Monthly Revenue & Commission</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Jan-Jul 2026 - Total: Rs. 15,42,200</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Commission</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCommission" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#gradRevenue)"
            dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="commission"
            name="Commission"
            stroke="var(--success)"
            strokeWidth={2}
            fill="url(#gradCommission)"
            dot={{ fill: 'var(--success)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}