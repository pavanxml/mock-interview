'use client';

import React, { useState } from 'react';
import { BookingState } from './BookingWizard';
import { ArrowLeft, ArrowRight, Clock, Users, AlertTriangle } from 'lucide-react';

interface StepDurationProps {
  booking: BookingState;
  updateBooking: (u: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DURATION_OPTIONS = [
  { id: 'dur-10', label: '1-10 min', minutes: 10, price: 50, desc: 'Quick intro round', popular: false, interviewers: 124 },
  { id: 'dur-20', label: '11-20 min', minutes: 20, price: 100, desc: 'Short screening session', popular: false, interviewers: 98 },
  { id: 'dur-30', label: '21-30 min', minutes: 30, price: 150, desc: 'Standard mock interview', popular: true, interviewers: 87 },
  { id: 'dur-40', label: '31-40 min', minutes: 40, price: 200, desc: 'In-depth technical round', popular: false, interviewers: 63 },
  { id: 'dur-50', label: '41-50 min', minutes: 50, price: 250, desc: 'Full interview simulation', popular: false, interviewers: 51 },
  { id: 'dur-60', label: '51-60 min', minutes: 60, price: 300, desc: 'Complete interview + debrief', popular: false, interviewers: 44 },
];

export default function StepDuration({ booking, updateBooking, onNext, onBack }: StepDurationProps) {
  const [error, setError] = useState('');

  const handleSelect = (opt: typeof DURATION_OPTIONS[0]) => {
    updateBooking({ durationLabel: opt.label, durationMinutes: opt.minutes, price: opt.price });
    setError('');
  };

  const handleNext = () => {
    if (!booking.durationMinutes) {
      setError('Please select an interview duration');
      return;
    }
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Select interview duration</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Interviewing for <span className="font-600 text-primary">{booking.technology}</span> - choose how long you want the session
        </p>
      </div>

      {/* Pricing info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info-bg border border-blue-200 mb-6">
        <Clock size={18} className="text-info flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-600 text-info">Transparent pricing, no hidden fees</p>
          <p className="text-xs text-info mt-0.5">
            All prices include GST. Interviewer earns 90% of session fee after 10% platform commission.
          </p>
        </div>
      </div>

      {/* Duration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {DURATION_OPTIONS.map((opt) => {
          const isSelected = booking.durationMinutes === opt.minutes;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all duration-150 w-full ${
                isSelected ? 'duration-card-selected' : 'border-border bg-card hover:border-amber-300 card-hover'
              }`}
            >
              {opt.popular && (
                <div className="absolute -top-2.5 left-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-700 gradient-accent text-white shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-lg font-700 ${isSelected ? 'text-amber-700' : 'text-foreground'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-800 tabular-nums ${isSelected ? 'text-amber-700' : 'text-foreground'}`}>
                    Rs. {opt.price}
                  </p>
                  <p className="text-xs text-muted-foreground">incl. GST</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground tabular-nums">{opt.interviewers} interviewers available</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* What's included */}
      <div className="bg-secondary rounded-xl p-5 mb-6">
        <p className="text-sm font-600 text-foreground mb-3">Every session includes</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {[
            'Live video interview (Google Meet / Zoom)',
            'Structured feedback report',
            'Technical Knowledge assessment',
            'Problem Solving evaluation',
            'Communication & Confidence rating',
            'Hiring Readiness score',
            'Strengths & Weaknesses analysis',
            'Downloadable PDF feedback',
          ].map((item, i) => (
            <div key={`include-${i}`} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
              <span className="text-xs text-secondary-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm mb-4 flex items-center gap-1.5">
          <AlertTriangle size={14} />
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button onClick={onBack} className="btn-secondary px-5 py-2.5">
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-4">
          {booking.durationMinutes && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{booking.durationLabel}</p>
              <p className="text-lg font-700 text-foreground tabular-nums">Rs. {booking.price}</p>
            </div>
          )}
          <button onClick={handleNext} disabled={!booking.durationMinutes} className="btn-primary px-6 py-2.5">
            Choose Schedule
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}