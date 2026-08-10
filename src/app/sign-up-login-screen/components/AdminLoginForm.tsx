'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Shield, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLoginValues {
  email: string;
  password: string;
}

const ADMIN_DEMO = { email: 'admin@interviewhub.in', password: 'Admin@Hub2024' };

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLoginValues>();

  const handleCopy = (field: 'email' | 'password') => {
    navigator.clipboard.writeText(field === 'email' ? ADMIN_DEMO.email : ADMIN_DEMO.password);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const onSubmit = async (data: AdminLoginValues) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: POST /api/auth/admin/login — JWT issued on success
    await new Promise((r) => setTimeout(r, 1500));
    if (data.email !== ADMIN_DEMO.email || data.password !== ADMIN_DEMO.password) {
      setIsLoading(false);
      toast.error('Invalid credentials — use the demo accounts below to sign in');
      return;
    }
    toast.success('Welcome, Admin!');
    setIsLoading(false);
    window.location.href = '/admin-dashboard';
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Portal</h2>
          <p className="text-xs text-muted-foreground">Restricted access — authorized personnel only</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-bg border border-amber-200 mb-5">
        <Shield size={14} className="text-warning flex-shrink-0" />
        <p className="text-xs text-warning font-500">
          This portal is for InterviewHub administrators only. Unauthorized access attempts are logged.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="admin-email">
            Admin email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="admin-email"
              type="email"
              placeholder="admin@interviewhub.in"
              className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Admin email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
            />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="admin-password">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Admin password"
              className={`input-field pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              Authenticating...
            </>
          ) : (
            <>
              <Shield size={16} />
              Access Admin Dashboard
            </>
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div className="mt-5 p-4 rounded-xl bg-info-bg border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-700 text-info uppercase tracking-wide">Demo Admin Credentials</p>
          <button
            onClick={() => {
              setValue('email', ADMIN_DEMO.email);
              setValue('password', ADMIN_DEMO.password);
              toast.success('Credentials filled');
            }}
            className="text-xs text-info font-600 hover:underline flex items-center gap-1"
          >
            <Check size={12} /> Autofill
          </button>
        </div>
        {[
          { label: 'Email', value: ADMIN_DEMO.email, field: 'email' as const },
          { label: 'Password', value: ADMIN_DEMO.password, field: 'password' as const },
        ].map((item) => (
          <div key={`admin-cred-${item.field}`} className="flex items-center justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">{item.label}: </span>
              <span className="text-xs font-mono-data text-foreground">{item.value}</span>
            </div>
            <button onClick={() => handleCopy(item.field)} className="text-muted-foreground hover:text-info transition-colors flex-shrink-0">
              {copied === item.field ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}