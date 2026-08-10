'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Briefcase, Building2, Clock, Upload, Eye, EyeOff, Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface InterviewerFormValues {
  fullName: string;
  email: string;
  phone: string;
  currentCompany: string;
  currentDesignation: string;
  yearsOfExperience: string;
  linkedinUrl: string;
  bio: string;
  password: string;
  confirmPassword: string;
  accountHolderName: string;
  upiId: string;
  bankAccount: string;
  ifscCode: string;
  agreeTerms: boolean;
}

const TECH_OPTIONS = [
  'Java Full Stack', 'Python Full Stack', 'MERN Stack', 'MEAN Stack',
  'Spring Boot', 'React', 'Angular', 'Node.js', 'Python', 'Django',
  'FastAPI', 'DevOps', 'AWS', 'Azure', 'Docker', 'Kubernetes',
  'Cyber Security', 'Ethical Hacking', 'SQL', 'MongoDB',
  'Data Science', 'Machine Learning', 'AI', 'Testing',
  'Automation Testing', 'System Design', 'DSA', 'HR Interview', 'Communication Skills',
];

const AVAIL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
import { API_BASE } from '@/lib/api';

const AVAIL_TIMES = [
  '6:00 AM-8:00 AM', '8:00 AM-10:00 AM', '10:00 AM-12:00 PM',
  '12:00 PM-2:00 PM', '2:00 PM-4:00 PM', '4:00 PM-6:00 PM',
  '6:00 PM-8:00 PM', '8:00 PM-10:00 PM',
];

export default function InterviewerRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [expProofFile, setExpProofFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InterviewerFormValues>();

  const password = watch('password');

  const toggleTech = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const onSubmit = async (data: InterviewerFormValues) => {
    if (selectedTechs.length === 0) {
      toast.error('Select at least one technology expertise');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('Select at least one available day');
      return;
    }
    if (selectedTimes.length === 0) {
      toast.error('Select at least one available time slot');
      return;
    }
    if (!resumeFile) {
      toast.error('Resume is required for verification');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/interviewer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          currentCompany: data.currentCompany,
          currentDesignation: data.currentDesignation,
          yearsOfExperience: data.yearsOfExperience,
          linkedinUrl: data.linkedinUrl,
          bio: data.bio,
          expertise: selectedTechs,
          availableDays: selectedDays,
          availableTimeSlots: selectedTimes,
          password: data.password,
          upiId: paymentMethod === 'upi' ? data.upiId || 'not-provided' : undefined,
          bankAccountLast4: paymentMethod === 'bank' ? (data.bankAccount || '').slice(-4) : undefined,
          resumeDocumentId: resumeFile.name,
        }),
      });

      if (!response.ok) {
        let message = 'Unable to submit interviewer application';
        try {
          const errorBody = await response.json();
          message = errorBody.message || errorBody.error || message;
        } catch {
          // Keep fallback message.
        }
        throw new Error(message);
      }

      toast.success('Application submitted for admin approval');
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit interviewer application');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8 fade-in">
        <div className="w-16 h-16 rounded-full bg-warning-bg flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-warning" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Application Submitted!</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Your interviewer profile is under review. Our team verifies all applications within 24-48 hours.
        </p>
        <div className="bg-warning-bg border border-amber-200 rounded-xl p-4 text-left">
          <p className="text-xs font-600 text-warning mb-2">What happens next?</p>
          {[
            'Admin reviews your company credentials and experience',
            'You receive an approval email with login instructions',
            'Set your availability and start accepting bookings',
          ].map((step, i) => (
            <div key={`step-${i}`} className="flex items-start gap-2 mb-1.5">
              <span className="w-4 h-4 rounded-full bg-warning text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-600">{i + 1}</span>
              <p className="text-xs text-warning">{step}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">Apply as Interviewer</h2>
        <p className="text-sm text-muted-foreground mt-1">Verified professionals only - admin reviews all applications</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Section: Personal Info */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Personal Information</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-name">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="iv-name" type="text" placeholder="Rahul Verma" className={`input-field pl-8 text-sm ${errors.fullName ? 'input-error' : ''}`}
                  {...register('fullName', { required: 'Required' })} />
              </div>
              {errors.fullName && <p className="text-danger text-xs mt-0.5">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-phone">Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="iv-phone" type="tel" placeholder="+91 98765..." className={`input-field pl-8 text-sm ${errors.phone ? 'input-error' : ''}`}
                  {...register('phone', { required: 'Required' })} />
              </div>
              {errors.phone && <p className="text-danger text-xs mt-0.5">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-email">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input id="iv-email" type="email" placeholder="rahul@company.com" className={`input-field pl-8 text-sm ${errors.email ? 'input-error' : ''}`}
                {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} />
            </div>
            {errors.email && <p className="text-danger text-xs mt-0.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-linkedin">LinkedIn Profile URL</label>
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              <input id="iv-linkedin" type="url" placeholder="https://linkedin.com/in/rahulverma" className={`input-field pl-8 text-sm ${errors.linkedinUrl ? 'input-error' : ''}`}
                {...register('linkedinUrl', { required: 'LinkedIn URL is required for verification' })} />
            </div>
            {errors.linkedinUrl && <p className="text-danger text-xs mt-0.5">{errors.linkedinUrl.message}</p>}
          </div>
        </div>

        {/* Section: Professional Info */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Professional Details</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-company">Current company</label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="iv-company" type="text" placeholder="Infosys / TCS / Startup" className={`input-field pl-8 text-sm ${errors.currentCompany ? 'input-error' : ''}`}
                  {...register('currentCompany', { required: 'Required' })} />
              </div>
              {errors.currentCompany && <p className="text-danger text-xs mt-0.5">{errors.currentCompany.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-desig">Designation</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="iv-desig" type="text" placeholder="Senior Engineer" className={`input-field pl-8 text-sm ${errors.currentDesignation ? 'input-error' : ''}`}
                  {...register('currentDesignation', { required: 'Required' })} />
              </div>
              {errors.currentDesignation && <p className="text-danger text-xs mt-0.5">{errors.currentDesignation.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-exp">Years of experience</label>
            <select id="iv-exp" className={`input-field text-sm ${errors.yearsOfExperience ? 'input-error' : ''}`}
              {...register('yearsOfExperience', { required: 'Required' })}>
              <option value="">Select experience</option>
              {['1-2 years', '3-5 years', '6-8 years', '9-12 years', '12+ years'].map((y) => (
                <option key={`exp-${y}`} value={y}>{y}</option>
              ))}
            </select>
            {errors.yearsOfExperience && <p className="text-danger text-xs mt-0.5">{errors.yearsOfExperience.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-bio">Short bio</label>
            <p className="text-xs text-muted-foreground mb-1">Visible to students - describe your expertise in 2-3 sentences</p>
            <textarea id="iv-bio" rows={3} placeholder="Senior Full Stack Developer at Wipro with 6 years of experience in Java and Spring Boot. Conducted 200+ technical interviews internally..." className={`input-field resize-none text-sm ${errors.bio ? 'input-error' : ''}`}
              {...register('bio', { required: 'Bio is required', minLength: { value: 50, message: 'Minimum 50 characters' } })} />
            {errors.bio && <p className="text-danger text-xs mt-0.5">{errors.bio.message}</p>}
          </div>
        </div>

        {/* Section: Technology Expertise */}
        <div className="bg-secondary rounded-xl p-4 xl:col-span-2">
          <p className="section-label mb-2">Technology Expertise</p>
          <p className="text-xs text-muted-foreground mb-3">Select all technologies you can interview candidates for</p>
          {selectedTechs.length === 0 && (
            <p className="text-xs text-danger mb-2">Select at least one technology</p>
          )}
          <div className="flex flex-wrap gap-2">
            {TECH_OPTIONS.map((tech) => (
              <button
                key={`tech-opt-${tech}`}
                type="button"
                onClick={() => toggleTech(tech)}
                className={`px-2.5 py-1 rounded-full text-xs font-500 border transition-all duration-150 ${
                  selectedTechs.includes(tech)
                    ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Availability */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Availability</p>
          <div>
            <p className="text-xs font-600 text-foreground mb-2">Available days</p>
            <div className="flex flex-wrap gap-2">
              {AVAIL_DAYS.map((day) => (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-lg text-xs font-600 border transition-all duration-150 ${
                    selectedDays.includes(day)
                      ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-600 text-foreground mb-2">Available time slots (IST)</p>
            <div className="grid grid-cols-2 gap-2">
              {AVAIL_TIMES.map((time) => (
                <button
                  key={`time-${time}`}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-500 border transition-all duration-150 text-left ${
                    selectedTimes.includes(time)
                      ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-primary'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Document Uploads */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Documents</p>

          {[
            { label: 'Resume', note: 'Required - PDF only', setter: setResumeFile, file: resumeFile, id: 'iv-resume', required: true },
            { label: 'Experience Proof', note: 'Offer letter / payslip (PDF)', setter: setExpProofFile, file: expProofFile, id: 'iv-exp-proof', required: false },
            { label: 'Company ID Card', note: 'Optional - increases approval speed', setter: setIdCardFile, file: idCardFile, id: 'iv-id', required: false },
            { label: 'Profile Photo', note: 'JPG/PNG, visible to students', setter: setPhotoFile, file: photoFile, id: 'iv-photo', required: false },
          ].map(({ label, note, setter, file, id, required }) => (
            <div key={`upload-${id}`}>
              <label className="block text-sm font-600 text-foreground mb-1">
                {label} {required && <span className="text-danger">*</span>}
              </label>
              <p className="text-xs text-muted-foreground mb-1">{note}</p>
              <label
                htmlFor={id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed cursor-pointer transition-colors ${
                  file ? 'border-success bg-success-bg' : 'border-border hover:border-primary bg-card'
                }`}
              >
                {file ? (
                  <>
                    <CheckCircle2 size={16} className="text-success flex-shrink-0" />
                    <span className="text-xs font-500 text-success truncate">{file.name}</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-500 text-muted-foreground">Click to upload</span>
                  </>
                )}
              </label>
              <input
                id={id}
                type="file"
                accept={label === 'Profile Photo' ? 'image/*' : '.pdf,image/*'}
                className="hidden"
                onChange={(e) => setter(e.target.files?.[0] || null)}
              />
            </div>
          ))}
        </div>

        {/* Section: Payment Details */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Payment Details</p>
          <p className="text-xs text-muted-foreground">Your earnings will be transferred here after admin approval</p>

          <div className="flex gap-2">
            {(['upi', 'bank'] as const).map((method) => (
              <button
                key={`pay-${method}`}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-2 rounded-lg text-sm font-600 border transition-all ${
                  paymentMethod === method ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary'
                }`}
              >
                {method === 'upi' ? 'UPI' : 'Bank Account'}
              </button>
            ))}
          </div>

          {paymentMethod === 'upi' ? (
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-upi">UPI ID</label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="iv-upi" type="text" placeholder="rahul@paytm / rahul@upi" className={`input-field pl-8 text-sm ${errors.upiId ? 'input-error' : ''}`}
                  {...register('upiId')} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-acc-name">Account holder name</label>
                <input id="iv-acc-name" type="text" placeholder="Rahul Verma" className="input-field text-sm"
                  {...register('accountHolderName')} />
              </div>
              <div>
                <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-acc-num">Account number</label>
                <input id="iv-acc-num" type="text" placeholder="XXXX XXXX XXXX" className="input-field text-sm font-mono-data"
                  {...register('bankAccount')} />
              </div>
              <div>
                <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-ifsc">IFSC code</label>
                <input id="iv-ifsc" type="text" placeholder="SBIN0001234" className="input-field text-sm font-mono-data uppercase"
                  {...register('ifscCode')} />
              </div>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="bg-secondary rounded-xl p-4 space-y-3">
          <p className="section-label">Set Password</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-pass">Password</label>
              <div className="relative">
                <input id="iv-pass" type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars" className={`input-field pr-9 text-sm ${errors.password ? 'input-error' : ''}`}
                  {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-danger text-xs mt-0.5">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-foreground mb-1" htmlFor="iv-confirm">Confirm</label>
              <div className="relative">
                <input id="iv-confirm" type={showConfirmPassword ? 'text' : 'password'} placeholder="Re-enter" className={`input-field pr-9 text-sm ${errors.confirmPassword ? 'input-error' : ''}`}
                  {...register('confirmPassword', { required: 'Required', validate: (v) => v === password || 'Mismatch' })} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-danger text-xs mt-0.5">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 xl:col-span-2">
          <input id="iv-terms" type="checkbox" className="w-4 h-4 mt-0.5 accent-primary flex-shrink-0"
            {...register('agreeTerms', { required: 'Accept terms to continue' })} />
          <label htmlFor="iv-terms" className="text-xs text-muted-foreground cursor-pointer">
            I confirm that I am currently employed at the company mentioned above and agree to InterviewHub&apos;s{' '}
            <span className="text-primary hover:underline">Interviewer Terms</span> and{' '}
            <span className="text-primary hover:underline">Privacy Policy</span>
          </label>
        </div>
        {errors.agreeTerms && <p className="text-danger text-xs xl:col-span-2">{errors.agreeTerms.message}</p>}

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-sm xl:col-span-2">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting application...
            </>
          ) : (
            'Submit Interviewer Application'
          )}
        </button>
      </form>
    </div>
  );
}


