'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Eye, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Applicant {
  id: string;
  name: string;
  email: string;
  company: string;
  designation: string;
  experience: string;
  technologies: string[];
  linkedinVerified: boolean;
  submittedAt: string;
  waitHours: number;
  resumeUploaded: boolean;
  idCardUploaded: boolean;
}

const PENDING_APPLICANTS: Applicant[] = [
  {
    id: 'app-001', name: 'Karthik Subramaniam', email: 'karthik.sub@wipro.com',
    company: 'Wipro Technologies', designation: 'Senior Software Engineer',
    experience: '6–8 years', technologies: ['Java Full Stack', 'Spring Boot', 'AWS'],
    linkedinVerified: true, submittedAt: '12 Jul, 11:30 PM', waitHours: 5,
    resumeUploaded: true, idCardUploaded: true,
  },
  {
    id: 'app-002', name: 'Sneha Kulkarni', email: 'sneha.k@infosys.com',
    company: 'Infosys Ltd', designation: 'Technology Analyst',
    experience: '3–5 years', technologies: ['MERN Stack', 'React', 'Node.js'],
    linkedinVerified: true, submittedAt: '12 Jul, 8:15 PM', waitHours: 8,
    resumeUploaded: true, idCardUploaded: false,
  },
  {
    id: 'app-003', name: 'Vijay Raghunathan', email: 'vijay.r@tcs.com',
    company: 'Tata Consultancy Services', designation: 'Lead Consultant',
    experience: '9–12 years', technologies: ['System Design', 'DSA', 'Python Full Stack'],
    linkedinVerified: false, submittedAt: '12 Jul, 3:00 PM', waitHours: 13,
    resumeUploaded: true, idCardUploaded: true,
  },
  {
    id: 'app-004', name: 'Deepika Nair', email: 'deepika.nair@accenture.com',
    company: 'Accenture India', designation: 'DevOps Engineer',
    experience: '3–5 years', technologies: ['DevOps', 'Docker', 'Kubernetes', 'AWS'],
    linkedinVerified: true, submittedAt: '11 Jul, 9:00 AM', waitHours: 19,
    resumeUploaded: true, idCardUploaded: false,
  },
  {
    id: 'app-005', name: 'Rahul Bhatia', email: 'rahul.bhatia@hcl.com',
    company: 'HCL Technologies', designation: 'Data Scientist',
    experience: '3–5 years', technologies: ['Machine Learning', 'Python', 'Data Science'],
    linkedinVerified: true, submittedAt: '11 Jul, 6:45 AM', waitHours: 21,
    resumeUploaded: true, idCardUploaded: true,
  },
  {
    id: 'app-006', name: 'Ananya Krishnamurthy', email: 'ananya.k@amazon.com',
    company: 'Amazon India', designation: 'SDE II',
    experience: '6–8 years', technologies: ['DSA', 'System Design', 'Java Full Stack'],
    linkedinVerified: true, submittedAt: '10 Jul, 2:00 PM', waitHours: 38,
    resumeUploaded: true, idCardUploaded: true,
  },
  {
    id: 'app-007', name: 'Manoj Gupta', email: 'manoj.gupta@cognizant.com',
    company: 'Cognizant', designation: 'Senior Angular Developer',
    experience: '3–5 years', technologies: ['Angular', 'MEAN Stack'],
    linkedinVerified: false, submittedAt: '10 Jul, 10:30 AM', waitHours: 42,
    resumeUploaded: false, idCardUploaded: false,
  },
];

export default function PendingApprovalsTable() {
  const [applicants, setApplicants] = useState(PENDING_APPLICANTS);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoadingId(id);
    setActionType(action);
    // BACKEND INTEGRATION: PATCH /api/admin/interviewers/:id/status with { status: 'approved' | 'rejected' }
    await new Promise((r) => setTimeout(r, 1200));
    setApplicants((prev) => prev.filter((a) => a.id !== id));
    setLoadingId(null);
    setActionType(null);
    const applicant = applicants.find((a) => a.id === id);
    if (action === 'approve') {
      toast.success(`${applicant?.name} approved — they'll receive an email to set up their profile`);
    } else {
      toast.error(`${applicant?.name}'s application rejected`);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-base font-700 text-foreground">Pending Interviewer Approvals</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{applicants.length} applications awaiting review</p>
        </div>
        {applicants.some((a) => a.waitHours >= 24) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-bg border border-red-200">
            <AlertTriangle size={14} className="text-danger" />
            <span className="text-xs font-600 text-danger">
              {applicants.filter((a) => a.waitHours >= 24).length} waiting 24+ hrs
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Applicant', 'Company & Role', 'Technologies', 'Documents', 'Wait Time', 'Actions'].map((col) => (
                <th key={`th-approval-${col}`} className="text-left px-5 py-3">
                  <span className="section-label">{col}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applicants.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
                  <p className="text-sm font-600 text-foreground">All caught up!</p>
                  <p className="text-xs mt-1">No pending interviewer applications</p>
                </td>
              </tr>
            ) : (
              applicants.map((applicant) => {
                const isLoading = loadingId === applicant.id;
                const isOverdue = applicant.waitHours >= 24;
                return (
                  <tr
                    key={applicant.id}
                    className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${
                      isOverdue ? 'bg-danger-bg/30' : ''
                    }`}
                  >
                    {/* Applicant */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-700 flex-shrink-0">
                          {applicant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-600 text-foreground">{applicant.name}</p>
                          <p className="text-xs text-muted-foreground">{applicant.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-600 text-foreground">{applicant.company}</p>
                      <p className="text-xs text-muted-foreground">{applicant.designation} · {applicant.experience}</p>
                    </td>

                    {/* Technologies */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {applicant.technologies.slice(0, 2).map((tech) => (
                          <span key={`tech-badge-${applicant.id}-${tech}`} className="px-1.5 py-0.5 rounded text-xs font-500 badge-info">
                            {tech}
                          </span>
                        ))}
                        {applicant.technologies.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-500 badge-neutral">
                            +{applicant.technologies.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Documents */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {applicant.resumeUploaded ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : (
                            <XCircle size={12} className="text-danger" />
                          )}
                          <span className="text-xs text-muted-foreground">Resume</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {applicant.idCardUploaded ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : (
                            <XCircle size={12} className="text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">ID Card</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {applicant.linkedinVerified ? (
                            <CheckCircle2 size={12} className="text-success" />
                          ) : (
                            <AlertTriangle size={12} className="text-warning" />
                          )}
                          <span className="text-xs text-muted-foreground">LinkedIn</span>
                        </div>
                      </div>
                    </td>

                    {/* Wait time */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className={isOverdue ? 'text-danger' : 'text-muted-foreground'} />
                        <span className={`text-sm font-600 tabular-nums ${isOverdue ? 'text-danger' : 'text-foreground'}`}>
                          {applicant.waitHours}h
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{applicant.submittedAt}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          title="View full application"
                        >
                          <Eye size={15} />
                        </button>
                        <a
                          href="#"
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-info transition-colors"
                          title="View LinkedIn profile"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <button
                          onClick={() => handleAction(applicant.id, 'approve')}
                          disabled={isLoading}
                          className="btn-success py-1.5 px-2.5 text-xs"
                          title="Approve interviewer"
                        >
                          {isLoading && actionType === 'approve' ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(applicant.id, 'reject')}
                          disabled={isLoading}
                          className="btn-danger py-1.5 px-2.5 text-xs"
                          title="Reject application"
                        >
                          {isLoading && actionType === 'reject' ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <XCircle size={13} />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}