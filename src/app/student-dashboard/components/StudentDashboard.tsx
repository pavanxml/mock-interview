'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Clock, Video, Star, Download, ChevronRight, CheckCircle, AlertCircle, TrendingUp, CreditCard, FileText, User, BookOpen, X, Save, Lock, Upload } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const API_BASE = '/api/v1';


export type StudentTab = 'overview' | 'upcoming' | 'history' | 'feedback' | 'payments' | 'reviews' | 'profile';


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'badge-success',
    scheduled: 'badge-info',
    completed: 'badge-success',
    cancelled: 'badge-danger',
    pending: 'badge-warning',
    refunded: 'badge-warning',
    success: 'badge-success',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-600 ${map[status] || 'badge-neutral'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= value ? 'text-accent fill-accent' : 'text-muted'} />
      ))}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-xs font-600 text-foreground w-6 text-right">{value}/5</span>
    </div>
  );
}

export default function StudentDashboardContent({ initialActiveTab = 'overview' }: { initialActiveTab?: StudentTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get('tab');
  const validTabs: StudentTab[] = ['upcoming', 'history', 'feedback', 'payments', 'reviews', 'profile'];
  const activeTab: StudentTab = urlTab && validTabs.includes(urlTab as StudentTab) ? (urlTab as StudentTab) : initialActiveTab;

  const goToTab = (tab: StudentTab) => {
    router.push(tab === 'overview' ? '/student-dashboard' : '/student-dashboard?tab=' + tab);
  };
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [portalData, setPortalData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        let email = '';
        try {
          const auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
          email = auth.email || '';
        } catch {}
        const params = email ? `?email=${encodeURIComponent(email)}` : '';
        const response = await fetch(`${API_BASE}/bookings/student/overview${params}`, { cache: 'no-store' });
        if (!response.ok) return;
        const body = await response.json();
        setPortalData(body.data);
      } catch {}
    };
    load();
  }, []);

  const upcomingInterviews = portalData?.upcoming ?? [];
  const bookingHistory = portalData?.history ?? [];
  const totalSpent = Number(portalData?.totalSpent || 0);
  const feedbackReports = portalData?.feedback ?? [];
  const formatMoney = (value: number | string) => 'Rs. ' + Number(value || 0).toLocaleString('en-IN');
  const paymentHistory = [...upcomingInterviews, ...bookingHistory].map((booking: any) => ({
    id: `PAY-${booking.id}`,
    bookingId: booking.id,
    technology: booking.technology,
    amount: booking.amount || 0,
    date: booking.date,
    method: 'Online',
    status: 'success',
    txnId: `TXN-${booking.id}`,
  }));
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewForm, setReviewForm] = useState({ bookingId: '', rating: 0, comment: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('resume.pdf');
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    name: 'Student',
    email: '',
    phone: '',
    college: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
  });


  useEffect(() => {
    try {
      const auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
      setProfile((prev) => ({
        ...prev,
        name: auth.fullName || auth.email?.split('@')[0] || prev.name,
        email: auth.email || prev.email,
        phone: auth.phone || prev.phone,
        college: auth.company || auth.college || prev.college,
        graduationYear: auth.graduationYear || prev.graduationYear,
        branch: auth.branch || prev.branch,
        cgpa: auth.cgpa || prev.cgpa,
      }));
    } catch {}
  }, []);
  const updateProfileField = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeFileName(file.name);
  };

  const downloadTextFile = (filename: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadFeedbackReport = (fb: any) => {
    downloadTextFile(`${fb.technology}-feedback-report.txt`, [
      'InterviewHub Feedback Report',
      `Technology: ${fb.technology}`,
      `Interviewer: ${fb.interviewer} (${fb.company})`,
      `Date: ${fb.date}`,
      `Overall Rating: ${fb.overallRating}/5`,
      `Hiring Readiness: ${fb.hiringReadiness}`,
      '',
      `Technical: ${fb.technical}/5`,
      `Problem Solving: ${fb.problemSolving}/5`,
      `Coding: ${fb.coding}/5`,
      `Communication: ${fb.communication}/5`,
      `Confidence: ${fb.confidence}/5`,
      '',
      `Strengths: ${fb.strengths}`,
      `Improvements: ${fb.improvements}`,
      `Suggestions: ${fb.suggestions || '-'}`,
    ].join('\n'));
  };

  const submitReview = () => {
    const booking = bookingHistory.find((item: any) => item.id === reviewForm.bookingId);
    if (!booking || reviewForm.rating === 0 || !reviewForm.comment.trim()) return;
    setReviews((prev) => [{
      id: `R${Date.now()}`,
      bookingId: booking.id,
      technology: booking.technology,
      interviewer: booking.interviewer,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }, ...prev]);
    setReviewForm({ bookingId: '', rating: 0, comment: '' });
  };

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-6">
      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: String(upcomingInterviews.length + bookingHistory.length), icon: BookOpen, color: 'text-primary', bg: 'bg-blue-50' },
              { label: 'Completed', value: String(bookingHistory.filter((b: any) => b.status === 'completed').length), icon: CheckCircle, color: 'text-success', bg: 'bg-green-50' },
              { label: 'Upcoming', value: String(upcomingInterviews.length), icon: Calendar, color: 'text-info', bg: 'bg-sky-50' },
              { label: 'Total Spent', value: formatMoney(totalSpent), icon: CreditCard, color: 'text-accent', bg: 'bg-amber-50' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card card-hover">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <Icon size={20} className={stat.color} />
                  </div>
                  <p className="text-2xl font-800 text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Upcoming interviews */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-700 text-foreground">Upcoming Interviews</h2>
              <button onClick={() => goToTab('upcoming')} className="text-xs text-primary font-600 flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-700 text-foreground">{interview.technology}</span>
                      <StatusBadge status={interview.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {interview.interviewer} - {interview.designation}, {interview.company}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar size={12} /> {interview.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={12} /> {interview.time}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp size={12} /> {interview.duration}
                      </span>
                    </div>
                  </div>
                  {interview.meetLink ? (
                    <a
                      href={interview.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-2 flex-shrink-0"
                    >
                      <Video size={14} /> Join Interview
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic flex-shrink-0">Link pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent feedback */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-700 text-foreground">Recent Feedback</h2>
              <button onClick={() => goToTab('feedback')} className="text-xs text-primary font-600 flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </button>
            </div>
            {feedbackReports.slice(0, 1).map((fb) => (
              <div key={fb.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-700 text-foreground">{fb.technology} Interview</h3>
                    <p className="text-sm text-muted-foreground">{fb.interviewer} - {fb.company} - {fb.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-800 text-primary">{fb.overallRating}</p>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <RatingBar label="Technical Knowledge" value={fb.technical} />
                  <RatingBar label="Problem Solving" value={fb.problemSolving} />
                  <RatingBar label="Communication" value={fb.communication} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-600 ${fb.hiringReadiness === 'Ready' ? 'badge-success' : 'badge-info'}`}>{fb.hiringReadiness}
                  </span>
                  <button type="button" onClick={() => downloadFeedbackReport(fb)} className="flex items-center gap-1.5 text-xs text-primary font-600 hover:underline">
                    <Download size={12} /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING TAB */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">Upcoming Interviews</h2>
          {upcomingInterviews.map((interview) => (
            <div key={interview.id} className="bg-card rounded-xl border border-border shadow-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {interview.technology.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-700 text-foreground">{interview.technology}</h3>
                    <StatusBadge status={interview.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    with <span className="font-600 text-foreground">{interview.interviewer}</span> - {interview.designation} at {interview.company}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { icon: Calendar, label: 'Date', value: interview.date },
                      { icon: Clock, label: 'Time', value: interview.time },
                      { icon: TrendingUp, label: 'Duration', value: interview.duration },
                      { icon: CreditCard, label: 'Paid', value: formatMoney(interview.amount) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-secondary rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={12} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">No rating</span>
                        </div>
                        <p className="text-sm font-600 text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                  {interview.meetLink ? (
                    <div className="flex flex-wrap gap-3">
                      <a href={interview.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        <Video size={14} /> Join Interview
                      </a>
                      <button className="btn-secondary text-sm px-4 py-2">
                        Copy Link
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-warning-bg border border-yellow-200 rounded-lg">
                      <AlertCircle size={14} className="text-warning flex-shrink-0" />
                      <p className="text-xs text-warning font-500">Meeting link will be shared by the interviewer before the session.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">Booking History</h2>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Booking</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Interviewer</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookingHistory.map((booking) => (
                    <tr key={booking.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-600 text-foreground text-sm">{booking.technology}</p>
                        <p className="text-xs text-muted-foreground">{booking.id}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-foreground">{booking.interviewer}</p>
                        <p className="text-xs text-muted-foreground">{booking.company}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{booking.date}</td>
                      <td className="px-5 py-4 text-sm font-600 text-foreground">{formatMoney(booking.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                      <td className="px-5 py-4">
                        {booking.rating ? <StarRating value={booking.rating} /> : <span className="text-xs text-muted-foreground">No rating</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">Feedback Reports</h2>
          {feedbackReports.map((fb: any) => (
            <div key={fb.id} className="bg-card rounded-xl border border-border shadow-card">
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setExpandedFeedback(expandedFeedback === fb.id ? null : fb.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-700 text-foreground">{fb.technology} Interview</h3>
                    <p className="text-sm text-muted-foreground">{fb.interviewer} - {fb.company} - {fb.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xl font-800 text-primary">{fb.overallRating}/5</p>
                    <span className={`text-xs font-600 ${fb.hiringReadiness === 'Ready' ? 'text-success' : 'text-info'}`}>{fb.hiringReadiness}
                    </span>
                  </div>
                  <ChevronRight size={18} className={`text-muted-foreground transition-transform ${expandedFeedback === fb.id ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {expandedFeedback === fb.id && (
                <div className="border-t border-border p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-600 text-foreground text-sm">Performance Breakdown</h4>
                      <RatingBar label="Technical Knowledge" value={fb.technical} />
                      <RatingBar label="Problem Solving" value={fb.problemSolving} />
                      <RatingBar label="Coding Skills" value={fb.coding} />
                      <RatingBar label="Communication" value={fb.communication} />
                      <RatingBar label="Confidence" value={fb.confidence} />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-600 text-success text-sm mb-2 flex items-center gap-1.5">
                          <CheckCircle size={14} /> Strengths
                        </h4>
                        <p className="text-sm text-foreground bg-green-50 rounded-lg p-3">{fb.strengths}</p>
                      </div>
                      <div>
                        <h4 className="font-600 text-warning text-sm mb-2 flex items-center gap-1.5">
                          <TrendingUp size={14} /> Areas to Improve
                        </h4>
                        <p className="text-sm text-foreground bg-amber-50 rounded-lg p-3">{fb.improvements}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-600 ${fb.hiringReadiness === 'Ready' ? 'badge-success' : 'badge-info'}`}>{fb.hiringReadiness}
                    </span>
                    <button type="button" onClick={() => downloadFeedbackReport(fb)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                      <Download size={14} /> Download PDF Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-700 text-foreground text-lg">Payment History</h2>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-xl font-800 text-foreground">Rs. {totalSpent.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Transaction</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Technology</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Method</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentHistory.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-600 text-foreground text-sm">{pay.id}</p>
                        <p className="text-xs text-muted-foreground font-mono-data">{pay.txnId}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-foreground">{pay.technology}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{pay.date}</td>
                      <td className="px-5 py-4 text-sm text-foreground">{pay.method}</td>
                      <td className="px-5 py-4 text-sm font-700 text-foreground">{formatMoney(pay.amount)}</td>
                      <td className="px-5 py-4"><StatusBadge status={pay.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 max-w-4xl">
          <h2 className="font-700 text-foreground text-lg">My Reviews</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            <h3 className="font-700 text-foreground">Add Review</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Completed Interview</label>
                <select className="input-field text-sm" value={reviewForm.bookingId} onChange={(e) => setReviewForm((prev) => ({ ...prev, bookingId: e.target.value }))}>
                  <option value="">Select booking</option>
                  {bookingHistory.filter((b: any) => b.status === 'completed').map((booking: any) => (
                    <option key={booking.id} value={booking.id}>{booking.technology} with {booking.interviewer}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Rating</label>
                <div className="flex gap-1 pt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button key={rating} type="button" onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}>
                      <Star size={22} className={rating <= reviewForm.rating ? 'text-accent fill-accent' : 'text-muted'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-600 text-foreground mb-2 block">Review</label>
              <textarea className="input-field text-sm resize-none" rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))} placeholder="Share your interview experience..." />
            </div>
            <button type="button" onClick={submitReview} disabled={!reviewForm.bookingId || !reviewForm.rating || !reviewForm.comment.trim()} className="btn-primary text-sm px-5 py-2">Submit Review</button>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border shadow-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-700 text-foreground">{review.technology}</p>
                    <p className="text-sm text-muted-foreground">{review.interviewer} - {review.date}</p>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-sm text-foreground mt-3">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* PROFILE TAB */}
      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-3xl">
          <h2 className="font-700 text-foreground text-lg">My Profile</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {profile.name.trim().charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="min-w-0">
                {editingProfile ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-field text-sm" value={profile.name} onChange={(event) => updateProfileField('name', event.target.value)} placeholder="Full name" />
                    <input className="input-field text-sm" value={profile.email} onChange={(event) => updateProfileField('email', event.target.value)} placeholder="Email address" />
                    <input className="input-field text-sm" value={profile.branch} onChange={(event) => updateProfileField('branch', event.target.value)} placeholder="Branch" />
                    <input className="input-field text-sm" value={profile.college} onChange={(event) => updateProfileField('college', event.target.value)} placeholder="College" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-800 text-foreground">{profile.name}</h3>
                    <p className="text-muted-foreground text-sm">{profile.branch || 'Branch not added'}</p>
                    <p className="text-muted-foreground text-sm">{[profile.college, profile.graduationYear ? `${profile.graduationYear} Batch` : ''].filter(Boolean).join(' - ') || 'College not added'}</p>
                  </>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="badge-success px-2.5 py-0.5 rounded-full text-xs font-600">Email Verified</span>
                  <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-600">{resumeFileName}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['college', 'College'],
                ['branch', 'Branch'],
                ['graduationYear', 'Graduation Year'],
                ['cgpa', 'CGPA'],
              ] as [keyof typeof profile, string][]).map(([field, label]) => (
                <div key={field} className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  {editingProfile ? (
                    <input
                      className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm font-600 text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={profile[field]}
                      onChange={(event) => updateProfileField(field, event.target.value)}
                    />
                  ) : (
                    <p className="text-sm font-600 text-foreground break-words">{profile[field] || 'Not added'}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-secondary p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-700 text-foreground">Resume</p>
                  <p className="text-xs text-muted-foreground mt-1">{resumeFileName}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                  <button type="button" onClick={() => resumeInputRef.current?.click()} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                    <Upload size={14} /> Re-upload Resume
                  </button>
                  <button type="button" onClick={() => downloadTextFile(`${profile.name || 'student'}-resume.txt`, `${profile.name} Resume`)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                    <Download size={14} /> Download Resume
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3">
              <button type="button" onClick={() => setEditingProfile((prev) => !prev)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                {editingProfile ? <Save size={14} /> : <User size={14} />} {editingProfile ? 'Save Profile' : 'Edit Profile'}
              </button>
              {editingProfile && (
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                  <X size={14} /> Cancel
                </button>
              )}
              <button type="button" onClick={() => setChangingPassword((prev) => !prev)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                <Lock size={14} /> Change Password
              </button>
            </div>

            {changingPassword && (
              <div className="mt-5 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input className="input-field text-sm" type="password" placeholder="Current password" />
                <input className="input-field text-sm" type="password" placeholder="New password" />
                <button type="button" onClick={() => setChangingPassword(false)} className="btn-primary text-sm px-4 py-2">Update Password</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

















