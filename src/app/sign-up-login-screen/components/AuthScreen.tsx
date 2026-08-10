'use client';

import React, { useState } from 'react';
import StudentLoginForm from './StudentLoginForm';
import StudentRegisterForm from './StudentRegistration';
import InterviewerRegisterForm from './InterviewerRegistration';
import InterviewerLoginForm from './InterviewerLoginForm';
import AdminLoginForm from './AdminLoginForm';
import AppLogo from '@/components/ui/AppLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Users, Briefcase, Shield, ArrowRight, Star, CheckCircle2, Video, FileText, TrendingUp } from 'lucide-react';

type Role = 'student' | 'interviewer' | 'admin';
type StudentMode = 'login' | 'register';
type InterviewerMode = 'login' | 'register';

const ROLE_TABS: { id: Role; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'student',
    label: 'Student',
    icon: <Users size={18} />,
    desc: 'Book mock interviews with real professionals',
  },
  {
    id: 'interviewer',
    label: 'Interviewer',
    icon: <Briefcase size={18} />,
    desc: 'Conduct interviews & earn from your expertise',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: <Shield size={18} />,
    desc: 'Manage platform operations',
  },
];

const TRUST_BADGES = [
  { label: '2,400+ Interviewers', icon: <Briefcase size={14} /> },
  { label: '18,000+ Students', icon: <Users size={14} /> },
  { label: '4.8 Avg Rating', icon: <Star size={14} /> },
];
const PLATFORM_SNAPSHOT = [
  { label: 'Live sessions today', value: '126', icon: <Video size={16} /> },
  { label: 'Feedback reports delivered', value: '9.8k', icon: <FileText size={16} /> },
  { label: 'Readiness improvement', value: '42%', icon: <TrendingUp size={16} /> },
];

export default function AuthScreen() {
  const [activeRole, setActiveRole] = useState<Role>('student');
  const [studentMode, setStudentMode] = useState<StudentMode>('login');
  const [interviewerMode, setInterviewerMode] = useState<InterviewerMode>('register');
  const isInterviewerRegister = activeRole === 'interviewer' && interviewerMode === 'register';

  return (
    <div className="min-h-screen overflow-hidden flex bg-background">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[46%] min-h-screen flex-col p-7 xl:p-9 relative overflow-hidden flex-shrink-0 bg-[linear-gradient(145deg,#10172a_0%,#284bff_52%,#8b5cf6_100%)]">
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-7">
            <AppLogo size={40} />
            <span className="text-white font-bold text-xl tracking-tight">InterviewHub</span>
          </div>

          <div className="mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-600 bg-white/15 text-white mb-4">
              <span className="pulse-dot" />
              Live interviews happening now
            </span>
            <h1 className="text-3xl xl:text-[2.35rem] font-extrabold text-white leading-tight mb-4">
              Practice with Real<br />Working Professionals
            </h1>
            <p className="text-blue-200 text-base leading-relaxed max-w-sm">
              Every mock interview on InterviewHub is conducted by a verified professional currently working at a top company, not AI or bots.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-2 mb-5">
            {[
              'Verified interviewers from Google, Amazon, Infosys & 200+ companies',
              'Live video interview via Google Meet, Zoom, or Teams',
              'Structured feedback report with hiring readiness score',
              'Prices starting at Rs. 50 for a 10-minute session',
            ].map((item, i) => (
              <div key={`feature-${i}`} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-blue-300 mt-0.5 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TRUST_BADGES.map((badge) => (
              <div
                key={`badge-${badge.label}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 text-white text-xs font-500"
              >
                {badge.icon}
                {badge.label}
              </div>
            ))}
          </div>
          <div className="bg-white/10 border border-white/15 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-white text-sm font-700">Platform snapshot</p>
              <span className="text-[11px] text-blue-100 bg-white/10 rounded-full px-2 py-1">Updated live</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORM_SNAPSHOT.map((item) => (
                <div key={item.label} className="rounded-lg bg-white/10 px-3 py-3">
                  <div className="text-blue-200 mb-2">{item.icon}</div>
                  <p className="text-white text-lg font-800 leading-none">{item.value}</p>
                  <p className="text-blue-100 text-[11px] leading-snug mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-[12px] text-blue-100">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Verified professionals only</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-300" /> Reports within 24 hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className={isInterviewerRegister ? "min-h-screen flex-1 flex flex-col items-center justify-start p-5 sm:p-8 bg-background overflow-y-auto" : "min-h-screen flex-1 flex flex-col items-center justify-center p-5 sm:p-8 bg-background overflow-y-auto"}>
        <div className="fixed right-5 top-5 z-30"><ThemeToggle /></div>
        <div className={isInterviewerRegister ? "w-full max-w-[760px] glass-panel rounded-2xl p-5 sm:p-6" : "w-full max-w-[480px] glass-panel rounded-2xl p-5 sm:p-6"}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-bold text-lg text-foreground">InterviewHub</span>
          </div>

          {/* Role Tabs */}
          <div className="mb-5">
            <p className="section-label mb-3">Select your role</p>
            <div className="grid grid-cols-3 gap-2 p-1 portal-tabs rounded-xl">
              {ROLE_TABS.map((tab) => (
                <button
                  key={`role-tab-${tab.id}`}
                  onClick={() => {
                    setActiveRole(tab.id);
                    setStudentMode('login');
                    setInterviewerMode(tab.id === 'interviewer' ? 'register' : 'login');
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-600 transition-all duration-150 ${
                    activeRole === tab.id
                      ? 'portal-tab-active'
                      : 'portal-tab-inactive'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {ROLE_TABS.find((t) => t.id === activeRole)?.desc}
            </p>
          </div>

          {/* Form Area */}
          <div className="fade-in" key={`form-${activeRole}-${studentMode}-${interviewerMode}`}>
            {activeRole === 'student' && studentMode === 'login' && (
              <StudentLoginForm onSwitchToRegister={() => setStudentMode('register')} />
            )}
            {activeRole === 'student' && studentMode === 'register' && (
              <StudentRegisterForm onSwitchToLogin={() => setStudentMode('login')} />
            )}
            {activeRole === 'interviewer' && interviewerMode === 'register' && (
              <InterviewerRegisterForm />
            )}
            {activeRole === 'interviewer' && interviewerMode === 'login' && (
              <InterviewerLoginForm onSwitchToRegister={() => setInterviewerMode('register')} />
            )}
            {activeRole === 'admin' && (
              <AdminLoginForm />
            )}
          </div>

          {/* Student toggle */}
          {activeRole === 'student' && (
            <p className="text-center text-sm text-muted-foreground mt-5">
              {studentMode === 'login' ? (
                <>
                  New to InterviewHub?{' '}
                  <button
                    onClick={() => setStudentMode('register')}
                    className="text-primary font-600 hover:underline"
                  >
                    Create account <ArrowRight size={12} className="inline" />
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setStudentMode('login')}
                    className="text-primary font-600 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          )}
          {activeRole === 'interviewer' && interviewerMode === 'register' && (
            <p className="text-center text-xs text-muted-foreground mt-5">
              Already approved?{' '}
              <button
                type="button"
                onClick={() => setInterviewerMode('login')}
                className="text-primary font-600 hover:underline"
              >
                Sign in to your interviewer account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}










