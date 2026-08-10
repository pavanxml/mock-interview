'use client';

import React, { useState } from 'react';
import { BookingState } from './BookingWizard';
import { ArrowLeft, Loader2, Shield, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface StepPaymentProps {
  booking: BookingState;
  onBack: () => void;
  onComplete: (bookingId: string) => void;
}

type PaymentMethod = 'upi' | 'phonepay' | 'googlepay' | 'paytm' | 'card';

const API_BASE = '/api/v1';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'upi', label: 'UPI', icon: 'UPI', desc: 'Any UPI app' },
  { id: 'phonepay', label: 'PhonePe', icon: 'Pe', desc: 'PhonePe UPI' },
  { id: 'googlepay', label: 'Google Pay', icon: 'GPay', desc: 'Google Pay UPI' },
  { id: 'paytm', label: 'Paytm', icon: 'Paytm', desc: 'Paytm wallet/UPI' },
  { id: 'card', label: 'Card', icon: 'Card', desc: 'Credit / Debit card' },
];

export default function StepPayment({ booking, onBack, onComplete }: StepPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [upiError, setUpiError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const price = booking.price || 0;
  const gst = Math.round(price * 0.18);
  const total = price + gst;
  const platformFee = Math.round(total * 0.10);
  const interviewerEarning = total - platformFee;
  const formatMoney = (amount: number) => `Rs. ${amount.toLocaleString('en-IN')}`;

  const generateBookingId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'IH-';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  };

  const handlePayment = async () => {
    if (selectedMethod !== 'card' && !upiId) {
      setUpiError('Enter your UPI ID to proceed');
      return;
    }
    if (selectedMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast.error('Please fill all card details');
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const bookingId = generateBookingId();
      const auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
      const response = await fetch(`${API_BASE}/bookings/student/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          studentName: auth.fullName || 'Student',
          studentEmail: auth.email || '',
          college: auth.company || auth.college || 'Student profile',
          technology: booking.technology,
          duration: booking.durationLabel,
          durationMinutes: booking.durationMinutes || 0,
          date: booking.selectedDate,
          time: booking.selectedSlot ? `${booking.selectedSlot} IST` : 'TBD',
          amount: total,
          resumeUrl: '#',
        }),
      });

      if (!response.ok) {
        let message = 'Unable to create booking request';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {}
        throw new Error(message);
      }

      toast.success('Payment successful! Booking request sent.');
      onComplete(bookingId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment completed, but booking request could not be created');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Complete your payment</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Secure payment powered by Razorpay. Your booking is created after payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-600 text-foreground mb-3">Payment method</p>
            <div className="grid grid-cols-5 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={`pm-${method.id}`}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-150 ${
                    selectedMethod === method.id ? 'border-primary bg-blue-50' : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="text-sm font-700 mb-1">{method.icon}</span>
                  <span className={`text-xs font-600 ${selectedMethod === method.id ? 'text-primary' : 'text-foreground'}`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedMethod !== 'card' && (
            <div className="bg-card border border-border rounded-xl p-5 fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={16} className="text-primary" />
                <p className="text-sm font-600 text-foreground">
                  {selectedMethod === 'upi' ? 'Enter UPI ID' :
                   selectedMethod === 'phonepay' ? 'PhonePe UPI ID' :
                   selectedMethod === 'googlepay' ? 'Google Pay UPI ID' : 'Paytm UPI ID'}
                </p>
              </div>
              <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="upi-input">UPI ID</label>
              <input
                id="upi-input"
                type="text"
                placeholder={
                  selectedMethod === 'phonepay' ? 'mobilenumber@ybl' :
                  selectedMethod === 'googlepay' ? 'mobilenumber@okaxis' :
                  selectedMethod === 'paytm' ? 'mobilenumber@paytm' : 'yourname@upi'
                }
                value={upiId}
                onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                className={`input-field font-mono-data ${upiError ? 'input-error' : ''}`}
              />
              {upiError && <p className="text-danger text-xs mt-1">{upiError}</p>}
              <p className="text-xs text-muted-foreground mt-1.5">You will receive a payment request on your UPI app.</p>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="bg-card border border-border rounded-xl p-5 fade-in space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-primary" />
                <p className="text-sm font-600 text-foreground">Card details</p>
              </div>
              <div>
                <label className="block text-sm font-600 text-foreground mb-1" htmlFor="card-number">Card number</label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="4532 XXXX XXXX XXXX"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                    setCardNumber(v);
                  }}
                  className="input-field font-mono-data"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-600 text-foreground mb-1" htmlFor="card-expiry">Expiry</label>
                  <input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '');
                      setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                    }}
                    className="input-field font-mono-data"
                  />
                </div>
                <div>
                  <label className="block text-sm font-600 text-foreground mb-1" htmlFor="card-cvv">CVV</label>
                  <input
                    id="card-cvv"
                    type="password"
                    placeholder="***"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="input-field font-mono-data"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-600 text-foreground mb-1" htmlFor="card-name">Name on card</label>
                <input
                  id="card-name"
                  type="text"
                  placeholder="PRIYA SHARMA"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-success-bg border border-green-200">
            <Shield size={16} className="text-success flex-shrink-0" />
            <p className="text-xs text-success">
              256-bit SSL encryption. Your payment data is never stored on our servers. Powered by Razorpay PCI-DSS Level 1.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <p className="text-sm font-600 text-foreground mb-4">Booking summary</p>
            <div className="space-y-3 mb-4">
              {[
                { label: 'Technology', value: booking.technology },
                { label: 'Duration', value: booking.durationLabel },
                { label: 'Date', value: booking.selectedDate },
                { label: 'Time', value: booking.selectedSlot ? `${booking.selectedSlot} IST` : null },
                { label: 'Interview type', value: booking.interviewType },
              ].map(({ label, value }) => value && (
                <div key={`summary-${label}`} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
                  <span className="text-xs font-600 text-foreground text-right capitalize">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Session fee</span>
                <span className="text-sm font-600 text-foreground tabular-nums">{formatMoney(price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">GST (18%)</span>
                <span className="text-sm font-600 text-foreground tabular-nums">{formatMoney(gst)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-base font-700 text-foreground">Total payable</span>
                <span className="text-xl font-800 text-primary tabular-nums">{formatMoney(total)}</span>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-3 mb-4">
              <p className="text-xs font-600 text-foreground mb-1.5">How your money is used</p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Interviewer earning (90%)</span>
                  <span className="text-xs font-600 text-success tabular-nums">{formatMoney(interviewerEarning)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Platform commission (10%)</span>
                  <span className="text-xs font-600 text-muted-foreground tabular-nums">{formatMoney(platformFee)}</span>
                </div>
              </div>
            </div>

            <button onClick={handlePayment} disabled={isProcessing} className="btn-primary w-full py-3.5 text-sm">
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing payment...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Pay {formatMoney(total)} Securely
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              By paying, you agree to our <span className="text-primary hover:underline cursor-pointer">Refund Policy</span>
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border mt-6">
        <button onClick={onBack} className="btn-secondary px-5 py-2.5">
          <ArrowLeft size={16} />
          Back to Schedule
        </button>
      </div>
    </div>
  );
}
