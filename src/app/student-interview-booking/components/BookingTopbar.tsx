import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { FileText, User } from 'lucide-react';

interface BookingTopbarProps {
  currentStep: number;
}

export default function BookingTopbar({ currentStep }: BookingTopbarProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <span className="font-bold text-lg text-foreground hidden sm:block">InterviewHub</span>
        </Link>

        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground hidden sm:block">Step {currentStep} of 4 —</span>
          <span className="text-xs font-600 text-foreground hidden sm:block">
            {currentStep === 1 ? 'Select Technology' : currentStep === 2 ? 'Choose Duration' : currentStep === 3 ? 'Pick Schedule' : 'Make Payment'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student-dashboard?tab=upcoming" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <FileText size={16} />
            <span className="hidden sm:block">My Bookings</span>
          </Link>
          <Link href="/student-dashboard?tab=profile" aria-label="Open profile" className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <User size={16} className="text-white" />
          </Link>
        </div>
      </div>
    </header>
  );
}
