'use client';

import React, { useState } from 'react';
import BookingTopbar from './BookingTopbar';
import StepTechnology from './StepTechnology';
import StepDuration from './StepDuration';
import StepSchedule from './StepSchedule';
import StepPayment from './StepPayment';
import BookingConfirmed from './BookingConfirmed';
import { CheckCircle2 } from 'lucide-react';

export interface BookingState {
  technology: string | null;
  technologyCategory: string | null;
  durationLabel: string | null;
  durationMinutes: number | null;
  price: number | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  interviewType: 'technical' | 'hr' | 'behavioral';
}

const STEPS = [
  { id: 1, label: 'Technology' },
  { id: 2, label: 'Duration' },
  { id: 3, label: 'Schedule' },
  { id: 4, label: 'Payment' },
];

const INITIAL_STATE: BookingState = {
  technology: null,
  technologyCategory: null,
  durationLabel: null,
  durationMinutes: null,
  price: null,
  selectedDate: null,
  selectedSlot: null,
  interviewType: 'technical',
};

export default function BookingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [booking, setBooking] = useState<BookingState>(INITIAL_STATE);
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');

  const updateBooking = (updates: Partial<BookingState>) => {
    setBooking((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handlePaymentComplete = (id: string) => {
    setBookingId(id);
    setIsComplete(true);
  };

  const handleBookAnother = () => {
    setBooking(INITIAL_STATE);
    setBookingId('');
    setCurrentStep(1);
    setIsComplete(false);
  };

  if (isComplete) {
    return <BookingConfirmed bookingId={bookingId} booking={booking} onBookAnother={handleBookAnother} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <BookingTopbar currentStep={currentStep} />

      {/* Step Progress */}
      <div className="bg-card border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex items-center py-4 overflow-x-auto scrollbar-thin">
            {STEPS.map((step, idx) => (
              <React.Fragment key={`step-${step.id}`}>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 transition-all duration-200 ${
                      step.id < currentStep
                        ? 'step-completed'
                        : step.id === currentStep
                        ? 'step-active' :'step-pending'
                    }`}
                  >
                    {step.id < currentStep ? <CheckCircle2 size={14} /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-600 transition-colors ${
                      step.id === currentStep ? 'text-primary' : step.id < currentStep ? 'text-success' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 mx-4 h-0.5 min-w-8 transition-colors ${step.id < currentStep ? 'bg-success' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-8">
        <div className="fade-in" key={`step-content-${currentStep}`}>
          {currentStep === 1 && (
            <StepTechnology
              booking={booking}
              updateBooking={updateBooking}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <StepDuration
              booking={booking}
              updateBooking={updateBooking}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <StepSchedule
              booking={booking}
              updateBooking={updateBooking}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <StepPayment
              booking={booking}
              onBack={prevStep}
              onComplete={handlePaymentComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}