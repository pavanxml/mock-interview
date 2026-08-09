'use client';

import React from 'react';
import Link from 'next/link';
import { BookingState } from './BookingWizard';
import { CheckCircle2, Calendar, Clock, Video, Download, Bell, ArrowRight, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BookingConfirmedProps {
  bookingId: string;
  booking: BookingState;
  onBookAnother: () => void;
}

export default function BookingConfirmed({ bookingId, booking, onBookAnother }: BookingConfirmedProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(bookingId);
    toast.success('Booking ID copied');
  };
  const handleDownloadReceipt = () => {
    const receiptLines = [
      'InterviewHub Booking Receipt',
      '============================',
      `Booking ID: ${bookingId}`,
      `Technology: ${booking.technology || 'N/A'}`,
      `Interview Type: ${booking.interviewType}`,
      `Duration: ${booking.durationLabel || 'N/A'}`,
      `Date: ${booking.selectedDate || 'N/A'}`,
      `Time: ${booking.selectedSlot ? `${booking.selectedSlot} IST` : 'TBD'}`,
      `Amount Paid: Rs. ${booking.price || 0}`,
      `Status: Booking request created`,
      '',
      'An interviewer will confirm the session and share the meeting link.',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
    ];

    const blob = new Blob([receiptLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InterviewHub-${bookingId}-receipt.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Success header */}
        <div className="text-center mb-8 slide-up">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4 shadow-card-md">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your interview request has been created. An interviewer will accept and send you the meeting link within 2 hours.
          </p>
        </div>

        {/* Booking ID */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4 fade-in">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-600 text-foreground">Booking ID</p>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <Copy size={12} />
              Copy
            </button>
          </div>
          <div className="bg-secondary rounded-lg px-4 py-3 text-center">
            <span className="font-mono-data text-xl font-700 text-primary tracking-widest">{bookingId}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: <Video size={14} />, label: 'Technology', value: booking.technology },
              { icon: <Clock size={14} />, label: 'Duration', value: booking.durationLabel },
              { icon: <Calendar size={14} />, label: 'Date', value: booking.selectedDate },
              { icon: <Clock size={14} />, label: 'Time', value: booking.selectedSlot ? `${booking.selectedSlot} IST` : 'TBD' },
            ].map(({ icon, label, value }) => (
              <div key={`conf-${label}`} className="bg-secondary rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
                <p className="text-sm font-600 text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-info-bg border border-blue-200 rounded-xl p-5 mb-4 fade-in">
          <p className="text-sm font-600 text-info mb-3">What happens next?</p>
          <div className="space-y-2.5">
            {[
              { step: 1, text: 'Matching interviewers are notified of your booking request' },
              { step: 2, text: 'An interviewer accepts and confirms the exact date/time' },
              { step: 3, text: 'You receive a Google Meet / Zoom link via email and notification' },
              { step: 4, text: 'Join the interview at the scheduled time' },
              { step: 5, text: 'Receive detailed feedback report within 24 hours' },
            ].map(({ step, text }) => (
              <div key={`next-${step}`} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-info text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-700">{step}</span>
                <p className="text-xs text-info">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notification setup */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-bg border border-amber-200 mb-6 fade-in">
          <Bell size={16} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-warning">
            Enable browser notifications to get instant alerts when your interviewer confirms the booking and sends the meeting link.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={handleDownloadReceipt} className="btn-secondary flex-1 py-3 text-sm">
            <Download size={16} />
            Download Receipt
          </button>
          <button type="button" onClick={onBookAnother} className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-2">
            Book Another Interview
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}