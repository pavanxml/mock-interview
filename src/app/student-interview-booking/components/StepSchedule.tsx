'use client';

import React, { useState } from 'react';
import { BookingState } from './BookingWizard';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';

interface StepScheduleProps {
  booking: BookingState;
  updateBooking: (u: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Generate next 14 days from today
function getNext14Days(): { date: string; dayLabel: string; dateLabel: string; monthLabel: string; isToday: boolean; isWeekend: boolean }[] {
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const today = new Date(
    Number(todayParts.find((part) => part.type === 'year')?.value),
    Number(todayParts.find((part) => part.type === 'month')?.value) - 1,
    Number(todayParts.find((part) => part.type === 'day')?.value),
  );
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    days.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayLabel: dayNames[d.getDay()],
      dateLabel: String(d.getDate()),
      monthLabel: monthNames[d.getMonth()],
      isToday: false,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }
  return days;
}

const ALL_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

export default function StepSchedule({ booking, updateBooking, onNext, onBack }: StepScheduleProps) {
  const days = getNext14Days();
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [error, setError] = useState('');
  const visibleDays = days.slice(calendarOffset, calendarOffset + 7);

  const getSlotsForDate = (date: string) => {
    const daySeed = date.split('-').reduce((total, part) => total + Number(part), 0);
    return ALL_SLOTS.map((slot) => ({
      time: slot,
      status: ((daySeed + ALL_SLOTS.indexOf(slot) * 7) % 5 === 0 ? 'booked' : 'available') as 'available' | 'booked',
    }));
  };

  const handleDateSelect = (date: string) => {
    updateBooking({ selectedDate: date, selectedSlot: null });
    setError('');
  };

  const handleSlotSelect = (slot: string, status: string) => {
    if (status === 'booked') return;
    updateBooking({ selectedSlot: slot });
    setError('');
  };

  const handleNext = () => {
    if (!booking.selectedDate) {
      setError('Please select a date');
      return;
    }
    if (!booking.selectedSlot) {
      setError('Please select a time slot');
      return;
    }
    onNext();
  };

  const selectedSlots = booking.selectedDate ? getSlotsForDate(booking.selectedDate) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pick your schedule</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a date and time slot. Interviewers matching your technology will be notified.
        </p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary border border-border mb-5">
        <Info size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Time slots are in IST. An interviewer will accept and confirm the exact meeting time within 2 hours of your booking. You&apos;ll receive an email + notification.
        </p>
      </div>

      {/* Date picker */}
      <div className="bg-card border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-600 text-foreground">Select date</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 7))}
              disabled={calendarOffset === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCalendarOffset(Math.min(7, calendarOffset + 7))}
              disabled={calendarOffset >= 7}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {visibleDays.map((day) => {
            const isSelected = booking.selectedDate === day.date;
            const hasSlots = true;
            return (
              <button
                key={`day-${day.date}`}
                onClick={() => handleDateSelect(day.date)}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-150 ${
                  isSelected
                    ? 'border-primary bg-blue-50'
                    : day.isWeekend
                    ? 'border-border bg-secondary/50 hover:border-primary/40' :'border-border bg-card hover:border-primary/40'
                }`}
              >
                <span className={`text-xs font-500 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                  {day.dayLabel}
                </span>
                <span className={`text-base font-700 mt-0.5 tabular-nums ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                  {day.dateLabel}
                </span>
                <span className={`text-xs ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                  {day.monthLabel}
                </span>
                {hasSlots && (
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {booking.selectedDate && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5 fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-600 text-foreground">Available time slots</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-success-bg border border-success" />
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-secondary border border-border" />
                <span className="text-xs text-muted-foreground">Booked</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {selectedSlots.map(({ time, status }) => {
              const isSelected = booking.selectedSlot === time;
              return (
                <button
                  key={`slot-${time}`}
                  onClick={() => handleSlotSelect(time, status)}
                  disabled={status === 'booked'}
                  className={`py-2.5 px-3 rounded-lg text-xs font-600 text-center transition-all duration-150 ${
                    isSelected
                      ? 'slot-selected'
                      : status === 'available' ?'slot-available' :'slot-booked'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!booking.selectedDate && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Select a date above to see available time slots</p>
        </div>
      )}

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
          Back</button>
        <div className="flex items-center gap-4">
          {booking.selectedDate && booking.selectedSlot && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{booking.selectedDate} at {booking.selectedSlot}</p>
              <p className="text-sm font-600 text-foreground">IST</p>
            </div>
          )}
          <button onClick={handleNext} disabled={!booking.selectedDate || !booking.selectedSlot} className="btn-primary px-6 py-2.5">
            Proceed to Payment
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
