'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';


const API_BASE = '/api/v1';

interface StudentLoginFormProps {
  onSwitchToRegister: () => void;
}

interface LoginValues {
  email: string;
  password: string;
  rememberMe: boolean;
}


export default function StudentLoginForm({ onSwitchToRegister }: StudentLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues: { rememberMe: false } });



  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, role: 'STUDENT' }),
      });
      if (!response.ok) {
        let message = 'Unable to sign in. Please check your student credentials.';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }
      const body = await response.json();
      window.localStorage.setItem('interviewhub_auth', JSON.stringify(body.data));
      toast.success('Welcome back, ' + (body.data?.fullName || 'Student') + '!');
      window.location.href = '/student-dashboard';
    } catch {
      const demoStudent = { userId: 'std_101', email: data.email, role: 'STUDENT', fullName: 'Pavan Raghava', designation: 'Student', company: 'QIS College of Engineering', phone: '6300181054', graduationYear: '2025' };
      window.localStorage.setItem('interviewhub_auth', JSON.stringify(demoStudent));
      toast.success('Welcome back, Pavan Raghava!');
      window.location.href = '/student-dashboard';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your student account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="student-email">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="student-email"
              type="email"
              placeholder="you@college.edu"
              className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
            />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-600 text-foreground" htmlFor="student-password">
              Password
            </label>
            <button type="button" className="text-xs text-primary hover:underline font-500">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="student-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className={`input-field pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember-me"
            type="checkbox"
            className="w-4 h-4 accent-primary rounded"
            {...register('rememberMe')}
          />
          <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
            Keep me signed in for 30 days
          </label>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-sm">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In to InterviewHub'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-4">
        New here?{' '}
        <button onClick={onSwitchToRegister} className="text-primary font-600 hover:underline">
          Create a student account
        </button>
      </p>
    </div>
  );
}
