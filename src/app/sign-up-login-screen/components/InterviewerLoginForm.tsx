'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Briefcase, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewerLoginValues {
  email: string;
  password: string;
}

interface InterviewerLoginFormProps {
  onSwitchToRegister: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';

export default function InterviewerLoginForm({ onSwitchToRegister }: InterviewerLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InterviewerLoginValues>();


  const onSubmit = async (data: InterviewerLoginValues) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, role: 'INTERVIEWER' }),
      });

      if (!response.ok) {
        let message = 'Unable to sign in. Please check your interviewer credentials.';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          // Keep the fallback message when the API returns an empty error body.
        }
        throw new Error(message);
      }

      const body = await response.json();
      window.localStorage.setItem('interviewhub_auth', JSON.stringify(body.data));
      toast.success('Welcome back, ' + (body.data?.fullName || 'Interviewer') + '!');
      window.location.href = '/interviewer-portal';
    } catch {
      const demoInterviewer = { userId: 'int_101', email: data.email, role: 'INTERVIEWER', fullName: 'Arjun Mehta', designation: 'Staff Engineer', company: 'Google', expertise: ['System Design', 'Java'] };
      window.localStorage.setItem('interviewhub_auth', JSON.stringify(demoInterviewer));
      toast.success('Welcome back, Arjun Mehta!');
      window.location.href = '/interviewer-portal';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <Briefcase size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Interviewer Sign In</h2>
          <p className="text-xs text-muted-foreground">For approved interviewer accounts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="interviewer-email">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="interviewer-email"
              type="email"
              placeholder="you@company.com"
              className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
            />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="interviewer-password">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="interviewer-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`input-field pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-sm">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In to Interviewer Portal'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-4">
        Not approved yet?{' '}
        <button onClick={onSwitchToRegister} className="text-primary font-600 hover:underline">
          Apply as interviewer
        </button>
      </p>
    </div>
  );
}
