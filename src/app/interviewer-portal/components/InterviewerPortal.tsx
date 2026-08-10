'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, CheckCircle, XCircle, Video, Star, TrendingUp, Wallet, AlertCircle, ChevronRight, Send, Download, Plus, Minus, Check, FileText } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';


const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];

export const INTERVIEWER_TABS = ['dashboard', 'requests', 'accepted', 'availability', 'feedback', 'earnings', 'reviews', 'profile'] as const;
export type InterviewerTab = (typeof INTERVIEWER_TABS)[number];


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: 'badge-info',
    completed: 'badge-success',
    pending: 'badge-warning',
    approved: 'badge-success',
    processing: 'badge-warning',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-600 ${map[status] || 'badge-neutral'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`transition-colors ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star size={onChange ? 20 : 14} className={s <= value ? 'text-accent fill-accent' : 'text-muted'} />
        </button>
      ))}

    </div>
  );
}

export default function InterviewerPortalContent({ initialActiveTab = 'dashboard' }: { initialActiveTab?: InterviewerTab }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InterviewerTab>(initialActiveTab);

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const goToTab = (tab: InterviewerTab) => {
    setActiveTab(tab);
    router.push(tab === 'dashboard' ? '/interviewer-portal' : `/interviewer-portal?tab=${tab}`);
  };
  const [acceptedRequests, setAcceptedRequests] = useState<string[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['6:00 PM', '7:00 PM', '8:00 PM']);
  const [meetLink, setMeetLink] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({
    interviewId: '',
    technical: 0,
    problemSolving: 0,
    coding: 0,
    communication: 0,
    confidence: 0,
    strengths: '',
    weaknesses: '',
    suggestions: '',
    overallRating: 0,
    hiringReadiness: 'Not Ready',
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [portalData, setPortalData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadPortalData = async () => {
    try {
      let auth: any = null;
      try {
        auth = JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}');
      } catch {}
      const params = new URLSearchParams();
      if (auth?.email) params.set('email', auth.email);
      if (Array.isArray(auth?.expertise) && auth.expertise.length > 0) params.set('expertise', auth.expertise.join(','));
      const response = await fetch(`${API_BASE}/interviewer/portal${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' });
      if (!response.ok) return;
      const body = await response.json();
      setPortalData(body.data);
    } catch {}
  };

  useEffect(() => {
    loadPortalData();
    try {
      setCurrentUser(JSON.parse(window.localStorage.getItem('interviewhub_auth') || '{}'));
    } catch {
      setCurrentUser(null);
    }
  }, []);

  const pendingRequests = portalData?.requests ?? [];
  const acceptedInterviews = portalData?.interviews?.map((item: any) => ({
    id: item.id,
    bookingId: item.bookingId,
    student: item.studentName,
    college: 'Student profile',
    technology: item.technology,
    date: item.startsAt.split(' ').slice(0, 3).join(' '),
    time: item.startsAt.split(' ').slice(3).join(' '),
    duration: item.duration || '45 min',
    meetLink: item.meetingUrl,
    status: item.status,
    feedbackSubmitted: item.status === 'feedback_submitted',
  })) ?? [];
  const walletBalance = Number(portalData?.walletBalance || 0);
  const transactionRows = acceptedInterviews.map((interview) => ({
    desc: `${interview.technology} - ${interview.student}`,
    date: interview.date || 'Today',
    amount: '+Rs. 0',
    type: 'credit',
    status: interview.status === 'completed' ? 'approved' : 'processing',
  }));
  const interviewerSignature = [currentUser?.fullName, [currentUser?.designation, currentUser?.company].filter(Boolean).join(', ')].filter(Boolean).join('\\n');


  const downloadTextFile = (filename: string, content: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const viewResume = (request: any) => {
    if (request.resumeUrl && request.resumeUrl !== '#') {
      window.open(request.resumeUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    downloadTextFile(`${request.student || 'student'}-resume.txt`, [
      'InterviewHub Resume Preview',
      `Student: ${request.student}`,
      `College: ${request.college}`,
      `Requested interview: ${request.technology}`,
      `Preferred date: ${request.preferredDate}`,
      `Preferred time: ${request.preferredTime}`,
      '',
      'Uploaded resume file is not available in local demo storage, so this preview contains the booking profile details sent with the request.',
    ].join('\n'));
  };
  const processRequest = async (id: string, action: 'accept' | 'decline') => {
    try {
      await fetch(`${API_BASE}/interviewer/requests/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'accept' ? JSON.stringify({
          interviewerEmail: currentUser?.email || '',
          interviewerName: currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Interviewer',
          company: currentUser?.company || 'InterviewHub',
          designation: currentUser?.designation || 'Interviewer',
        }) : undefined,
      });
      await loadPortalData();
    } catch {}
    if (action === 'accept') {
      setAcceptedRequests((prev) => [...prev, id]);
      goToTab('accepted');
    }
    if (action === 'decline') setRejectedRequests((prev) => [...prev, id]);
  };


  const confirmAndNotifyStudent = async (requestId: string, student: string, technology: string) => {
    if (!meetLink.trim()) {
      alert('Please add a Google Meet, Zoom, or Teams link before notifying the student.');
      return;
    }
    const message = `Hello ${student},\n\nYour ${technology} mock interview has been confirmed. Please join 10 minutes early.\n\nRegards,\n${interviewerSignature}`;
    const response = await fetch(`${API_BASE}/interviewer/requests/${requestId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingUrl: meetLink, message }),
    });
    if (!response.ok) {
      alert('Unable to send meeting link. Please try again.');
      return;
    }
    setMeetLink('');
    setAcceptedRequests((prev) => prev.filter((id) => id !== requestId));
    await loadPortalData();
    alert('Meeting link sent to student.');
  };
  const markInterviewCompleted = async (requestId: string) => {
    const response = await fetch(`${API_BASE}/interviewer/requests/${requestId}/complete`, { method: 'POST' });
    if (!response.ok) {
      alert('Unable to mark interview completed. Please try again.');
      return;
    }
    await loadPortalData();
    goToTab('feedback');
    alert('Interview marked completed. You can submit feedback now.');
  };

  const submitFeedbackReport = async () => {
    if (!feedbackForm.interviewId) {
      alert('Please select an interview.');
      return;
    }
    if (!feedbackForm.technical || !feedbackForm.problemSolving || !feedbackForm.coding || !feedbackForm.communication || !feedbackForm.confidence || !feedbackForm.overallRating) {
      alert('Please add all ratings before submitting feedback.');
      return;
    }
    if (!feedbackForm.strengths.trim() || !feedbackForm.weaknesses.trim()) {
      alert('Please add strengths and areas to improve.');
      return;
    }
    const response = await fetch(`${API_BASE}/interviewer/bookings/${feedbackForm.interviewId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        technical: feedbackForm.technical,
        problemSolving: feedbackForm.problemSolving,
        coding: feedbackForm.coding,
        communication: feedbackForm.communication,
        confidence: feedbackForm.confidence,
        overallRating: feedbackForm.overallRating,
        strengths: feedbackForm.strengths,
        improvements: feedbackForm.weaknesses,
        suggestions: feedbackForm.suggestions,
        hiringReadiness: feedbackForm.hiringReadiness,
      }),
    });
    if (!response.ok) {
      alert('Unable to submit feedback. Please try again.');
      return;
    }
    setFeedbackSubmitted(true);
    setFeedbackForm({
      interviewId: '',
      technical: 0,
      problemSolving: 0,
      coding: 0,
      communication: 0,
      confidence: 0,
      strengths: '',
      weaknesses: '',
      suggestions: '',
      overallRating: 0,
      hiringReadiness: 'Not Ready',
    });
    await loadPortalData();
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]);
  };

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-6">
      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Interviews', value: String(acceptedInterviews.length), icon: CheckCircle, color: 'text-success', bg: 'bg-green-50' },
              { label: 'Pending Requests', value: String(pendingRequests.length), icon: AlertCircle, color: 'text-warning', bg: 'bg-amber-50' },
              { label: 'Wallet Balance', value: 'Rs. ' + walletBalance.toLocaleString('en-IN'), icon: Wallet, color: 'text-primary', bg: 'bg-blue-50' },
              { label: 'Avg Rating', value: String(portalData?.rating || '0.0'), icon: Star, color: 'text-accent', bg: 'bg-yellow-50' },
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

          {/* New requests alert */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-600 text-warning">You have {pendingRequests.length} new interview requests</p>
                <p className="text-xs text-amber-600">Accept requests before they expire. Students are waiting!</p>
              </div>
              <button onClick={() => goToTab('requests')} className="btn-primary text-sm px-4 py-2 flex-shrink-0">
                View Requests
              </button>
            </div>
          )}

          {/* Upcoming interviews */}
          <div className="bg-card rounded-xl border border-border shadow-card">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-700 text-foreground">Upcoming Interviews</h2>
              <button onClick={() => goToTab('accepted')} className="text-xs text-primary font-600 flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {acceptedInterviews.filter((i) => i.status === 'accepted' || i.status === 'confirmed' || i.status === 'upcoming').map((interview) => (
                <div key={interview.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-700 text-foreground">{interview.technology}</span>
                      <StatusBadge status={interview.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{interview.student} - {interview.college}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar size={12} /> {interview.date}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock size={12} /> {interview.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {interview.meetLink ? (
                      <a href={interview.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                        <Video size={14} /> Start Interview
                      </a>
                    ) : (
                      <button onClick={() => goToTab('accepted')} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                        <Send size={14} /> Send Meeting Link
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">Pending Interview Requests</h2>
          {pendingRequests.map((req) => {
            const isAccepted = acceptedRequests.includes(req.id);
            const isRejected = rejectedRequests.includes(req.id);
            return (
              <div key={req.id} className={`bg-card rounded-xl border shadow-card p-5 transition-all ${isAccepted ? 'border-green-300 bg-green-50/30' : isRejected ? 'border-red-200 opacity-60' : 'border-border'}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {req.student.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-700 text-foreground">{req.student}</h3>
                      <span className="badge-info px-2.5 py-0.5 rounded-full text-xs font-600">{req.technology}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{req.college}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Preferred Date', value: req.preferredDate },
                        { label: 'Preferred Time', value: req.preferredTime },
                        { label: 'Duration', value: req.duration },
                        { label: 'Your Earnings', value: `Rs. ${Number(req.amount || 0).toLocaleString('en-IN')}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-secondary rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">{label}</p>
                          <p className="text-sm font-600 text-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Posted {req.postedAt}</p>
                    {!isAccepted && !isRejected ? (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => processRequest(req.id, 'accept')}
                          className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
                        >
                          <CheckCircle size={14} /> Accept Request
                        </button>
                        <button
                          onClick={() => processRequest(req.id, 'decline')}
                          className="btn-secondary text-sm px-5 py-2 flex items-center gap-2 text-danger border-red-200 hover:bg-danger hover:text-white"
                        >
                          <XCircle size={14} /> Decline
                        </button>
                        <button type="button" onClick={() => viewResume(req)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"><Download size={14} /> View Resume</button>
                      </div>
                    ) : isAccepted ? (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle size={16} />
                        <span className="text-sm font-600">Request Accepted - Schedule the interview now</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <XCircle size={16} />
                        <span className="text-sm">Request Declined</span>
                      </div>
                    )}

                    {/* Schedule form after accept */}
                    {isAccepted && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                        <h4 className="font-600 text-foreground text-sm">Schedule Interview & Share Meeting Link</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Confirm Date</label>
                            <input type="date" className="input-field text-sm" defaultValue="2026-07-20" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Confirm Time</label>
                            <input type="time" className="input-field text-sm" defaultValue="19:00" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Meeting Link (Google Meet / Zoom / Teams)</label>
                          <input
                            type="url"
                            className="input-field text-sm"
                            placeholder="https://meet.google.com/..."
                            value={meetLink}
                            onChange={(e) => setMeetLink(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Message to Student (optional)</label>
                          <textarea
                            className="input-field text-sm resize-none"
                            rows={3}
                            defaultValue={`Hello ${req.student},\n\nYour ${req.technology} mock interview has been confirmed. Please join 10 minutes early.\n\nRegards,\n${interviewerSignature}`}
                          />
                        </div>
                        <button onClick={() => confirmAndNotifyStudent(req.id, req.student, req.technology)} className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
                          <Send size={14} /> Confirm & Notify Student
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACCEPTED TAB */}
      {activeTab === 'accepted' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">Accepted Interviews</h2>
          {acceptedInterviews.map((interview) => (
            <div key={interview.id} className="bg-card rounded-xl border border-border shadow-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-700 text-foreground">{interview.technology}</h3>
                    <StatusBadge status={interview.status} />
                    {interview.feedbackSubmitted && (
                      <span className="badge-success px-2.5 py-0.5 rounded-full text-xs font-600">Feedback Submitted</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{interview.student} - {interview.college}</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar size={12} /> {interview.date}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock size={12} /> {interview.time}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><TrendingUp size={12} /> {interview.duration}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {interview.meetLink && (
                    <a href={interview.meetLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                      <Video size={14} /> Start Interview
                    </a>
                  )}
                  {interview.status === 'confirmed' && (
                    <button onClick={() => markInterviewCompleted(interview.bookingId)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                      <CheckCircle size={14} /> Mark Completed
                    </button>
                  )}
                  {interview.status === 'completed' && !interview.feedbackSubmitted && (
                    <button onClick={() => goToTab('feedback')} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                      <FileText size={14} /> Submit Feedback
                    </button>
                  )}
                </div>
              </div>
              {!interview.meetLink && (interview.status === 'accepted' || interview.status === 'scheduled') && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                  <h4 className="font-600 text-foreground text-sm">Generate Meeting Link & Notify Student</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                    <input
                      type="url"
                      className="input-field text-sm"
                      placeholder="Paste Google Meet / Zoom / Teams link"
                      value={meetLink}
                      onChange={(event) => setMeetLink(event.target.value)}
                    />
                    <button onClick={() => confirmAndNotifyStudent(interview.bookingId, interview.student, interview.technology)} className="btn-primary text-sm px-5 py-2 flex items-center justify-center gap-2">
                      <Send size={14} /> Send Link
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">This sends a notification to the student and updates their dashboard with the join link.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AVAILABILITY TAB */}
      {activeTab === 'availability' && (
        <div className="space-y-6 max-w-2xl">
          <h2 className="font-700 text-foreground text-lg">Manage Availability</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-600 text-foreground mb-4">Available Days</h3>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-600 border transition-all ${
                    selectedDays.includes(day)
                      ? 'bg-primary text-white border-primary' :'bg-secondary text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-600 text-foreground mb-4">Available Time Slots</h3>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`px-4 py-2 rounded-lg text-sm font-600 border transition-all ${
                    selectedSlots.includes(slot)
                      ? 'bg-primary text-white border-primary' :'bg-secondary text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-600 text-foreground mb-4">Max Interviews Per Day</h3>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Minus size={16} />
              </button>
              <span className="text-2xl font-800 text-foreground w-12 text-center">3</span>
              <button className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
            <Check size={16} /> Save Availability
          </button>
        </div>
      )}

      {/* FEEDBACK TAB */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 max-w-2xl">
          <h2 className="font-700 text-foreground text-lg">Submit Interview Feedback</h2>
          {feedbackSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
              <CheckCircle size={48} className="text-success mx-auto mb-4" />
              <h3 className="font-700 text-foreground text-lg mb-2">Feedback Submitted!</h3>
              <p className="text-muted-foreground text-sm">The student has been notified and can now view and download their feedback report.</p>
              <button onClick={() => setFeedbackSubmitted(false)} className="btn-primary text-sm px-5 py-2 mt-4">
                Submit Another
              </button>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-5">
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Select Interview</label>
                <select
                  className="input-field text-sm"
                  value={feedbackForm.interviewId}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, interviewId: e.target.value }))}
                >
                  <option value="">Choose an interview...</option>
                  {acceptedInterviews.filter((i) => i.status === 'completed' && !i.feedbackSubmitted).map((i) => (
                    <option key={i.id} value={i.bookingId}>{i.student} - {i.technology} ({i.date})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'technical', label: 'Technical Knowledge' },
                  { key: 'problemSolving', label: 'Problem Solving' },
                  { key: 'coding', label: 'Coding Skills' },
                  { key: 'communication', label: 'Communication' },
                  { key: 'confidence', label: 'Confidence' },
                  { key: 'overallRating', label: 'Overall Rating' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-sm font-600 text-foreground mb-2 block">{label}</label>
                    <StarRating
                      value={feedbackForm[key as keyof typeof feedbackForm] as number}
                      onChange={(v) => setFeedbackForm((prev) => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Hiring Readiness</label>
                <select
                  className="input-field text-sm"
                  value={feedbackForm.hiringReadiness}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, hiringReadiness: e.target.value }))}
                >
                  <option>Not Ready</option>
                  <option>Needs Improvement</option>
                  <option>Almost Ready</option>
                  <option>Ready</option>
                  <option>Highly Recommended</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Strengths</label>
                <textarea
                  className="input-field text-sm resize-none"
                  rows={3}
                  placeholder="What did the student do well?"
                  value={feedbackForm.strengths}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, strengths: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Areas to Improve</label>
                <textarea
                  className="input-field text-sm resize-none"
                  rows={3}
                  placeholder="What should the student work on?"
                  value={feedbackForm.weaknesses}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, weaknesses: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Suggestions for Improvement</label>
                <textarea
                  className="input-field text-sm resize-none"
                  rows={3}
                  placeholder="Specific resources, topics, or actions..."
                  value={feedbackForm.suggestions}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, suggestions: e.target.value }))}
                />
              </div>

              <button
                onClick={submitFeedbackReport}
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 w-full justify-center"
              >
                <Send size={16} /> Submit Feedback Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <h2 className="font-700 text-foreground text-lg">Earnings & Wallet</h2>

          {/* Wallet card */}
          <div className="gradient-primary rounded-2xl p-6 text-white">
            <p className="text-sm opacity-80 mb-1">Available Balance</p>
            <p className="text-4xl font-800 mb-4">Rs. {walletBalance.toLocaleString('en-IN')}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="opacity-70">Total Earned</p>
                <p className="font-700">Rs. {walletBalance.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="opacity-70">Withdrawn</p>
                <p className="font-700">Rs. 0</p>
              </div>
              <div>
                <p className="opacity-70">This Month</p>
                <p className="font-700">Rs. {walletBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Withdrawal request */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5">
            <h3 className="font-700 text-foreground mb-4">Request Withdrawal</h3>
            {withdrawSubmitted ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={20} className="text-success flex-shrink-0" />
                <div>
                  <p className="font-600 text-success text-sm">Withdrawal request submitted!</p>
                  <p className="text-xs text-muted-foreground">Admin will process within 2-3 business days.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-600 text-foreground mb-2 block">Amount (Rs.)</label>
                    <input
                      type="number"
                      className="input-field text-sm"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={walletBalance}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Available: Rs. {walletBalance.toLocaleString('en-IN')} - Min: Rs. 500</p>
                  </div>
                  <div>
                    <label className="text-sm font-600 text-foreground mb-2 block">Payment Method</label>
                    <select className="input-field text-sm">
                      <option>Configured payout method</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setWithdrawSubmitted(true)}
                  className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
                  disabled={!withdrawAmount || Number(withdrawAmount) < 500 || Number(withdrawAmount) > walletBalance}
                >
                  <Wallet size={14} /> Request Withdrawal
                </button>
              </div>
            )}
          </div>

          {/* Transaction history */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-700 text-foreground">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-700 text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactionRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                        No real earnings yet. Completed interviews will appear here.
                      </td>
                    </tr>
                  ) : (
                    transactionRows.map((txn, i) => (
                      <tr key={i} className="hover:bg-secondary/50 transition-colors">
                        <td className="px-5 py-4 text-sm text-foreground">{txn.desc}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{txn.date}</td>
                        <td className="px-5 py-4 text-sm font-700 text-success">{txn.amount}</td>
                        <td className="px-5 py-4"><StatusBadge status={txn.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* REVIEWS TAB */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <h2 className="font-700 text-foreground text-lg">My Reviews</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
            <Star size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-600 text-foreground">No real reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">Student reviews will appear after completed interviews.</p>
          </div>
        </div>
      )}
      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-3xl">
          <h2 className="font-700 text-foreground text-lg">Profile</h2>
          <div className="bg-card rounded-xl border border-border shadow-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Display Name</label>
                <input className="input-field text-sm" defaultValue={currentUser?.fullName || ''} />
              </div>
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Company</label>
                <input className="input-field text-sm" defaultValue={currentUser?.company || ''} />
              </div>
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Designation</label>
                <input className="input-field text-sm" defaultValue={currentUser?.designation || ''} />
              </div>
              <div>
                <label className="text-sm font-600 text-foreground mb-2 block">Base Price</label>
                <input className="input-field text-sm" defaultValue="250" />
              </div>
            </div>
            <div>
              <label className="text-sm font-600 text-foreground mb-2 block">Bio</label>
              <textarea className="input-field text-sm resize-none" rows={4} defaultValue={`${currentUser?.designation || ''} ${currentUser?.company ? `at ${currentUser.company}` : ''}`.trim()} />
            </div>
            <button className="btn-primary text-sm px-5 py-2" onClick={() => alert('Profile saved')}>Save Profile</button>
          </div>
        </div>
      )}
    </div>
  );
}











