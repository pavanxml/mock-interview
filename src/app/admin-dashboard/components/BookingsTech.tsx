'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const TECH_BOOKINGS = [
  { tech: 'MERN', bookings: 312 },
  { tech: 'Java FS', bookings: 287 },
  { tech: 'React', bookings: 241 },
  { tech: 'Spring', bookings: 198 },
  { tech: 'DSA', bookings: 176 },
  { tech: 'Python', bookings: 154 },
  { tech: 'AWS', bookings: 132 },
  { tech: 'DevOps', bookings: 118 },
  { tech: 'Angular', bookings: 97 },
  { tech: 'ML/AI', bookings: 84 },
];

const BAR_COLORS = [
  'var(--primary)', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#10b981',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-card-md">
      <p className="text-sm font-700 text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">
        <span className="font-700 text-primary tabular-nums">{payload[0].value}</span> bookings this month
      </p>
    </div>
  );
}

export default function BookingsTechChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card h-full">
      <div className="mb-5">
        <h3 className="text-base font-700 text-foreground">Bookings by Technology</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Top 10 · July 2026</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={TECH_BOOKINGS}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="tech"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)' }} />
          <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
            {TECH_BOOKINGS.map((entry, index) => (
              <Cell key={`cell-tech-${entry.tech}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}