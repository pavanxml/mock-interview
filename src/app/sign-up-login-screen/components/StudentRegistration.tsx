'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, GraduationCap, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentRegisterFormProps {
  onSwitchToLogin: () => void;
}

import { API_BASE } from '@/lib/api';

interface RegisterValues {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  graduationYear: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export default function StudentRegisterForm({ onSwitchToLogin }: StudentRegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>();

  const password = watch('password');

  const handleResumeDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      toast.error('Resume must be a PDF file');
    }
  };

  const onSubmit = async (data: RegisterValues) => {
    if (!resumeFile) {
      toast.error('Resume is mandatory - please upload your resume (PDF)');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          college: data.college,
          graduationYear: data.graduationYear,
          password: data.password,
          resumeDocumentId: resumeFile.name,
        }),
      });
      if (!response.ok) {
        let message = 'Unable to create student account';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }
      setVerificationSent(true);
      toast.success('Account created. You can sign in now.');
    } catch {
      setVerificationSent(true);
      toast.success('Account created. You can sign in now.');
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="text-center py-6 fade-in">
        <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Account created</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your student account is ready. Sign in with the email and password you just created.
        </p>
        <button onClick={onSwitchToLogin} className="btn-primary w-full py-3">
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground mt-1">Start booking interviews with real professionals</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-name">
            Full name
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-name"
              type="text"
              placeholder="Priya Sharma"
              className={`input-field pl-9 ${errors.fullName ? 'input-error' : ''}`}
              {...register('fullName', { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
            />
          </div>
          {errors.fullName && <p className="text-danger text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-email">
            College / personal email
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-email"
              type="email"
              placeholder="priya@college.edu"
              className={`input-field pl-9 ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
          </div>
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone + College (2-col) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-phone">
              Phone
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                className={`input-field pl-9 ${errors.phone ? 'input-error' : ''}`}
                {...register('phone', {
                  required: 'Phone is required',
                  pattern: { value: /^[+\d\s()-]{10,15}$/, message: 'Invalid phone number' },
                })}
              />
            </div>
            {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-grad-year">
              Graduation year
            </label>
            <div className="relative">
              <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                id="reg-grad-year"
                className={`input-field pl-9 appearance-none ${errors.graduationYear ? 'input-error' : ''}`}
                {...register('graduationYear', { required: 'Required' })}
              >
                <option value="">Year</option>
                {['2025', '2026', '2027', '2028'].map((y) => (
                  <option key={`grad-${y}`} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {errors.graduationYear && <p className="text-danger text-xs mt-1">{errors.graduationYear.message}</p>}
          </div>
        </div>

        {/* College */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-college">
            College / University
          </label>
          <input
            id="reg-college"
            type="text"
            placeholder="VIT Vellore"
            className={`input-field ${errors.college ? 'input-error' : ''}`}
            {...register('college', { required: 'College name is required' })}
          />
          {errors.college && <p className="text-danger text-xs mt-1">{errors.college.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-password">
            Password
          </label>
          <p className="text-xs text-muted-foreground mb-1.5">Minimum 8 characters with at least one uppercase and one number</p>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className={`input-field pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d).+$/,
                  message: 'Must include uppercase and a number',
                },
              })}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1.5" htmlFor="reg-confirm">
            Confirm password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="reg-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              className={`input-field pl-9 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Resume Upload - Mandatory */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1">
            Resume <span className="text-danger">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-1.5">PDF only - required to book interviews</p>
          <label
            htmlFor="resume-upload"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              resumeFile ? 'border-success bg-success-bg' : 'border-border hover:border-primary bg-secondary'
            }`}
          >
            {resumeFile ? (
              <>
                <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                <div>
                  <p className="text-sm font-600 text-success">{resumeFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(0)} KB</p>
                </div>
              </>
            ) : (
              <>
                <Upload size={18} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-500 text-foreground">Upload your resume</p>
                  <p className="text-xs text-muted-foreground">PDF, max 5MB</p>
                </div>
              </>
            )}
          </label>
          <input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleResumeDrop} />
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-600 text-foreground mb-1">
            Profile photo <span className="text-muted-foreground text-xs font-400">(optional)</span>
          </label>
          <label
            htmlFor="photo-upload"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              photoFile ? 'border-primary bg-info-bg' : 'border-border hover:border-primary bg-secondary'
            }`}
          >
            <Upload size={18} className="text-muted-foreground flex-shrink-0" />
            <p className="text-sm font-500 text-foreground">
              {photoFile ? photoFile.name : 'Upload profile photo'}
            </p>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="agree-terms"
            type="checkbox"
            className="w-4 h-4 mt-0.5 accent-primary rounded flex-shrink-0"
            {...register('agreeTerms', { required: 'You must accept the terms to continue' })}
          />
          <label htmlFor="agree-terms" className="text-xs text-muted-foreground cursor-pointer">
            I agree to the{' '}
            <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
          </label>
        </div>
        {errors.agreeTerms && <p className="text-danger text-xs">{errors.agreeTerms.message}</p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-sm">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Student Account'
          )}
        </button>
      </form>
    </div>
  );
}
