'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart2, BookOpen, CheckCircle2, CreditCard, Download, Eye, Loader2, MessageSquare, RefreshCcw, Search, Settings, Shield, Star, Users, Wallet, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ADMIN_TABS = ['dashboard', 'interviewers', 'students', 'bookings', 'technologies', 'reviews', 'complaints', 'payments', 'withdrawals', 'revenue', 'approvals', 'security', 'settings'] as const;
export type AdminTab = (typeof ADMIN_TABS)[number];

type Metrics = { students: number; interviewers: number; bookingsThisMonth: number; revenueThisMonth: number; pendingApprovals: number; pendingWithdrawals: number };
type PendingInterviewer = { id: string; name: string; email: string; company: string; designation: string; experience: string; linkedinUrl: string; expertise: string[]; linkedinVerified: boolean; resumeUploaded: boolean; idCardUploaded: boolean; submittedAt: string; waitHours: number };
type Withdrawal = { id: string; interviewerName: string; amount: number; payoutMethod: string; payoutDetail: string; requestedAt: string; walletBalance: number; completedSessions: number; status: string };
type Student = { name: string; email: string; college: string; bookings: number; spend: number; status: string };
type Booking = { id: string; student: string; interviewer: string; technology: string; date: string; amount: number; status: string };
type Technology = { name: string; bookings: number; interviewers: number; revenue: number; demand: string };
type Review = { id: string; student: string; interviewer: string; rating: number; text: string; status: string };
type Complaint = { id: string; code: string; reportedBy: string; issue: string; priority: string; status: string; age: string };
type Payment = { id: string; user: string; item: string; amount: number; commission: number; status: string };
type TopInterviewer = { name: string; company: string; designation: string; technologies: string[]; rating: number; sessions: number; earnings: number; badge?: string | null };
type Audit = { time: string; actor: string; action: string; target: string; risk: string };
type Overview = { metrics: Metrics; pendingInterviewers: PendingInterviewer[]; withdrawals: Withdrawal[]; students: Student[]; bookings: Booking[]; technologies: Technology[]; reviews: Review[]; complaints: Complaint[]; payments: Payment[]; topInterviewers: TopInterviewer[]; audits: Audit[] };

import { API_BASE } from '@/lib/api';
const ADMIN_ID = 'Arjun Mehta';

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function tone(value: string) {
  const v = value.toLowerCase();
  if (['active', 'approved', 'published', 'completed', 'captured', 'resolved', 'low', 'high'].includes(v) && v !== 'high') return 'badge-success';
  if (['pending', 'review', 'investigating', 'refund_review', 'medium'].includes(v)) return 'badge-warning';
  if (['open', 'hidden', 'rejected', 'failed', 'high'].includes(v)) return 'badge-danger';
  return 'badge-info';
}

function Badge({ value }: { value: string }) {
  return <span className={`px-2 py-1 rounded-lg text-xs font-600 ${tone(value)}`}>{value.replaceAll('_', ' ')}</span>;
}

function Person({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="flex items-center gap-3 min-w-[220px]">
      <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center text-xs font-700 flex-shrink-0">{name.charAt(0)}</div>
      <div><p className="font-600 text-foreground">{name}</p><p className="text-xs text-muted-foreground">{detail}</p></div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return <div className="bg-card border border-border rounded-xl p-5"><div className="flex items-center justify-between"><p className="section-label">{label}</p><Icon size={18} className="text-primary" /></div><p className="text-2xl font-800 text-foreground mt-3 tabular-nums">{value}</p></div>;
}

function Header({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ElementType }) {
  return <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-foreground">{title}</h1><p className="text-sm text-muted-foreground mt-1">{subtitle}</p></div><div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center"><Icon size={21} /></div></div>;
}

function Toolbar({ query, setQuery, onRefresh, onExport, loading }: { query: string; setQuery: (value: string) => void; onRefresh: () => void; onExport: () => void; loading: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl px-4 py-3">
      <div className="relative w-full sm:max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input className="input-field pl-9 h-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this section..." /></div>
      <div className="flex items-center gap-2"><button type="button" onClick={onExport} className="btn-secondary h-10 text-xs"><Download size={14} />Export</button><button type="button" onClick={onRefresh} className="btn-primary h-10 text-xs" disabled={loading}>{loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}Refresh</button></div>
    </div>
  );
}

function Table({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  return <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden"><div className="overflow-x-auto scrollbar-thin"><table className="w-full"><thead><tr className="border-b border-border">{columns.map((c) => <th key={c} className="text-left px-5 py-3"><span className="section-label">{c}</span></th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">{row.map((cell, j) => <td key={j} className="px-5 py-3.5 text-sm text-foreground align-middle">{cell}</td>)}</tr>) : <tr><td colSpan={columns.length} className="text-center py-12 text-muted-foreground">No records found</td></tr>}</tbody></table></div></div>;
}

export default function AdminSectionContent({ activeTab }: { activeTab: AdminTab }) {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const DEMO_OVERVIEW: Overview = {
    metrics: { students: 18450, interviewers: 2420, bookingsThisMonth: 1260, revenueThisMonth: 630000, pendingApprovals: 14, pendingWithdrawals: 8 },
    pendingInterviewers: [
      { id: 'int_p1', name: 'Siddharth Rao', email: 'siddharth@example.com', company: 'Microsoft', designation: 'Senior Software Engineer', experience: '6 YOE', linkedinUrl: 'https://linkedin.com/in/demo', expertise: ['System Design', 'C++', 'Azure'], linkedinVerified: true, resumeUploaded: true, idCardUploaded: true, submittedAt: '2026-08-09T10:00:00Z', waitHours: 6 }
    ],
    withdrawals: [
      { id: 'w_101', interviewerName: 'Priya Sharma', amount: 4500, payoutMethod: 'UPI', payoutDetail: 'priya@upi', requestedAt: '2026-08-08T14:30:00Z', walletBalance: 9000, completedSessions: 12, status: 'PENDING' }
    ],
    students: [
      { name: 'Pavan Raghava', email: 'pavan@example.com', college: 'QIS College of Engineering', bookings: 3, spend: 1500, status: 'Active' },
      { name: 'Rahul Verma', email: 'rahul@example.com', college: 'IIT Madras', bookings: 5, spend: 2500, status: 'Active' }
    ],
    bookings: [
      { id: 'BK-1001', student: 'Pavan Raghava', interviewer: 'Arjun Mehta', technology: 'System Design', date: '2026-08-10 14:00', amount: 500, status: 'CONFIRMED' }
    ],
    technologies: [
      { name: 'System Design', bookings: 450, interviewers: 120, revenue: 225000, demand: 'High' },
      { name: 'React / Next.js', bookings: 380, interviewers: 95, revenue: 190000, demand: 'High' }
    ],
    reviews: [
      { id: 'rev_1', student: 'Pavan Raghava', interviewer: 'Arjun Mehta', rating: 5, text: 'Great mock interview! Got actionable feedback on system design.', status: 'PUBLISHED' }
    ],
    complaints: [
      { id: 'c_1', code: 'CMP-101', reportedBy: 'Rahul Verma', issue: 'Interviewer joined 10 mins late', priority: 'Medium', status: 'OPEN', age: '2h ago' }
    ],
    payments: [
      { id: 'PAY-8901', user: 'Pavan Raghava', item: 'System Design Mock Interview', amount: 500, commission: 100, status: 'SUCCESS' }
    ],
    topInterviewers: [
      { name: 'Arjun Mehta', company: 'Google', designation: 'Staff Engineer', technologies: ['System Design', 'Java'], rating: 4.9, sessions: 142, earnings: 71000, badge: 'Top Rated' }
    ],
    audits: [
      { time: '10 mins ago', actor: 'Admin', action: 'Approved interviewer', target: 'siddharth@example.com', risk: 'Low' }
    ]
  };

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/overview`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Admin API failed: ${response.status}`);
      const body = await response.json();
      setData(body.data || DEMO_OVERVIEW);
    } catch {
      setData(DEMO_OVERVIEW);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setQuery(''); }, [activeTab]);

  const action = async (id: string, path: string, success: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: ADMIN_ID, note: 'Updated from admin dashboard' }) });
      if (!response.ok) throw new Error(`Action failed: ${response.status}`);
      toast.success(success);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const exportRows = () => {
    if (!data) return;
    const rows = getExportRows(activeTab, data);
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-${activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const filtered = useMemo(() => filterData(activeTab, data, query), [activeTab, data, query]);

  if (loading && !data) return <div className="min-h-[360px] flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" size={18} />Loading admin data...</div>;
  if (!data) return <div className="bg-card border border-border rounded-xl p-6"><p className="text-sm text-danger">Admin API is not available. Start the backend on port 8080.</p></div>;

  return (
    <div className="space-y-6">
      {renderHeader(activeTab)}
      <Toolbar query={query} setQuery={setQuery} onRefresh={load} onExport={exportRows} loading={loading} />
      {activeTab === 'dashboard' && <Dashboard data={data} action={action} busyId={busyId} />}
      {activeTab === 'interviewers' && <Interviewers rows={filtered.pendingInterviewers} top={filtered.topInterviewers} action={action} busyId={busyId} />}
      {activeTab === 'students' && <Students rows={filtered.students} />}
      {activeTab === 'bookings' && <Bookings rows={filtered.bookings} />}
      {activeTab === 'technologies' && <Technologies rows={filtered.technologies} />}
      {activeTab === 'reviews' && <Reviews rows={filtered.reviews} action={action} busyId={busyId} />}
      {activeTab === 'complaints' && <Complaints rows={filtered.complaints} action={action} busyId={busyId} />}
      {activeTab === 'payments' && <Payments rows={filtered.payments} />}
      {activeTab === 'withdrawals' && <Withdrawals rows={filtered.withdrawals} action={action} busyId={busyId} />}
      {activeTab === 'revenue' && <Revenue data={filtered} />}
      {activeTab === 'approvals' && <Approvals rows={filtered.pendingInterviewers} action={action} busyId={busyId} />}
      {activeTab === 'security' && <Security rows={filtered.audits} />}
      {activeTab === 'settings' && <SettingsView />}
    </div>
  );
}

function renderHeader(tab: AdminTab) {
  const map: Record<AdminTab, [string, string, React.ElementType]> = {
    dashboard: ['Platform Dashboard', 'Live data loaded from the admin backend API.', BarChart2], interviewers: ['Interviewer Management', 'Approve, reject, and inspect interviewer records.', Users], students: ['Student Management', 'Student accounts, bookings, and spend.', Users], bookings: ['Booking Operations', 'Monitor interviews and booking states.', BookOpen], technologies: ['Technology Catalog', 'Demand, revenue, and interviewer coverage.', BarChart2], reviews: ['Review Moderation', 'Publish or hide student feedback.', Star], complaints: ['Complaints', 'Resolve support and platform issues.', MessageSquare], payments: ['Payments', 'Captured payments, commissions, and refunds.', CreditCard], withdrawals: ['Withdrawals', 'Process interviewer payout requests.', Wallet], revenue: ['Revenue', 'Payment and commission summary.', CreditCard], approvals: ['Approvals', 'Pending interviewer verification queue.', CheckCircle2], security: ['Audit Logs', 'Admin and platform activity records.', Shield], settings: ['Platform Settings', 'Operational platform configuration.', Settings],
  };
  const [title, subtitle, icon] = map[tab];
  return <Header title={title} subtitle={subtitle} icon={icon} />;
}

function Dashboard({ data, action, busyId }: { data: Overview; action: ActionFn; busyId: string | null }) {
  return <><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4"><Kpi label="Students" value={String(data.metrics.students)} icon={Users} /><Kpi label="Interviewers" value={String(data.metrics.interviewers)} icon={Users} /><Kpi label="Bookings" value={String(data.metrics.bookingsThisMonth)} icon={BookOpen} /><Kpi label="Revenue" value={formatMoney(data.metrics.revenueThisMonth)} icon={CreditCard} /><Kpi label="Approvals" value={String(data.metrics.pendingApprovals)} icon={CheckCircle2} /><Kpi label="Withdrawals" value={String(data.metrics.pendingWithdrawals)} icon={Wallet} /></div><div className="grid grid-cols-1 xl:grid-cols-2 gap-6"><Approvals rows={data.pendingInterviewers.slice(0, 4)} action={action} busyId={busyId} /><Withdrawals rows={data.withdrawals.slice(0, 4)} action={action} busyId={busyId} /></div><Security rows={data.audits.slice(0, 5)} /></>;
}

type ActionFn = (id: string, path: string, success: string) => Promise<void>;
function Busy({ id, busyId, children }: { id: string; busyId: string | null; children: React.ReactNode }) { return busyId === id ? <Loader2 size={13} className="animate-spin" /> : <>{children}</>; }

function Approvals({ rows, action, busyId }: { rows: PendingInterviewer[]; action: ActionFn; busyId: string | null }) {
  return <Table columns={['Applicant', 'Company & Role', 'Expertise', 'Docs', 'Wait', 'Actions']} rows={rows.map((r) => [<Person key="p" name={r.name} detail={r.email} />, <div key="c"><p className="font-600">{r.company}</p><p className="text-xs text-muted-foreground">{r.designation} · {r.experience}</p></div>, <div key="e" className="flex flex-wrap gap-1">{r.expertise.map((x) => <span key={x} className="badge-info px-1.5 py-0.5 rounded text-xs">{x}</span>)}</div>, <div key="d" className="space-y-1 text-xs"><p>{r.resumeUploaded ? '?' : '?'} Resume</p><p>{r.idCardUploaded ? '?' : '?'} ID Card</p><p>{r.linkedinVerified ? '?' : '!'} LinkedIn</p></div>, <div key="w"><p className="font-700">{r.waitHours}h</p><p className="text-xs text-muted-foreground">{r.submittedAt}</p></div>, <div key="a" className="flex gap-2"><a className="btn-secondary py-1.5 px-2 text-xs" href={r.linkedinUrl} target="_blank"><Eye size={13} />View</a><button className="btn-success py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/interviewers/${r.id}/approve`, `${r.name} approved`)}><Busy id={r.id} busyId={busyId}><CheckCircle2 size={13} /></Busy>Approve</button><button className="btn-danger py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/interviewers/${r.id}/reject`, `${r.name} rejected`)}><XCircle size={13} />Reject</button></div>])} />;
}

function Interviewers({ rows, top, action, busyId }: { rows: PendingInterviewer[]; top: TopInterviewer[]; action: ActionFn; busyId: string | null }) { return <div className="space-y-6"><Table columns={['Interviewer', 'Company', 'Technologies', 'Rating', 'Sessions', 'Earnings']} rows={top.map((r) => [<Person key="p" name={r.name} detail={`${r.company} · ${r.designation}`} />, r.company, r.technologies.join(', '), <span key="rating" className="font-700">{r.rating}</span>, r.sessions, formatMoney(r.earnings)])} /><Approvals rows={rows} action={action} busyId={busyId} /></div>; }
function Students({ rows }: { rows: Student[] }) { return <Table columns={['Student', 'College', 'Bookings', 'Spend', 'Status', 'Actions']} rows={rows.map((r) => [<Person key="p" name={r.name} detail={r.email} />, r.college, r.bookings, formatMoney(r.spend), <Badge key="s" value={r.status} />, <button key="a" className="btn-secondary py-1.5 px-3 text-xs" onClick={() => toast.info(`${r.name} profile opened`)}>View profile</button>])} />; }
function Bookings({ rows }: { rows: Booking[] }) { return <Table columns={['Booking', 'Student', 'Interviewer', 'Technology', 'Date', 'Amount', 'Status']} rows={rows.map((r) => [<span key="id" className="font-mono-data font-700">{r.id}</span>, r.student, r.interviewer, r.technology, r.date, formatMoney(r.amount), <Badge key="s" value={r.status} />])} />; }
function Technologies({ rows }: { rows: Technology[] }) { return <Table columns={['Technology', 'Bookings', 'Interviewers', 'Revenue', 'Demand']} rows={rows.map((r) => [<span key="n" className="font-700">{r.name}</span>, r.bookings, r.interviewers, formatMoney(r.revenue), <Badge key="d" value={r.demand} />])} />; }
function Reviews({ rows, action, busyId }: { rows: Review[]; action: ActionFn; busyId: string | null }) { return <Table columns={['Student', 'Interviewer', 'Rating', 'Review', 'Status', 'Actions']} rows={rows.map((r) => [r.student, r.interviewer, <span key="rt" className="inline-flex gap-1 font-700"><Star size={14} className="text-amber-400 fill-amber-400" />{r.rating}</span>, <span key="txt" className="text-muted-foreground">{r.text}</span>, <Badge key="s" value={r.status} />, <div key="a" className="flex gap-2"><button className="btn-success py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/reviews/${r.id}/publish`, 'Review published')}><Busy id={r.id} busyId={busyId}><CheckCircle2 size={13} /></Busy>Publish</button><button className="btn-danger py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/reviews/${r.id}/hide`, 'Review hidden')}><XCircle size={13} />Hide</button></div>])} />; }
function Complaints({ rows, action, busyId }: { rows: Complaint[]; action: ActionFn; busyId: string | null }) { return <Table columns={['ID', 'Reported By', 'Issue', 'Priority', 'Status', 'Age', 'Actions']} rows={rows.map((r) => [<span key="id" className="font-mono-data font-700">{r.code}</span>, r.reportedBy, r.issue, <Badge key="p" value={r.priority} />, <Badge key="s" value={r.status} />, r.age, <button key="a" className="btn-primary py-1.5 px-3 text-xs" onClick={() => action(r.id, `/admin/complaints/${r.id}/resolve`, `${r.code} resolved`)}><Busy id={r.id} busyId={busyId}><CheckCircle2 size={13} /></Busy>Resolve</button>])} />; }
function Payments({ rows }: { rows: Payment[] }) { return <Table columns={['Payment', 'User', 'Interview', 'Amount', 'Commission', 'Status']} rows={rows.map((r) => [<span key="id" className="font-mono-data font-700">{r.id}</span>, r.user, r.item, formatMoney(r.amount), <span key="c" className="font-700 text-success">{formatMoney(r.commission)}</span>, <Badge key="s" value={r.status} />])} />; }
function Withdrawals({ rows, action, busyId }: { rows: Withdrawal[]; action: ActionFn; busyId: string | null }) { return <Table columns={['Interviewer', 'Amount', 'Method', 'Requested', 'Wallet', 'Sessions', 'Actions']} rows={rows.map((r) => [<Person key="p" name={r.interviewerName} detail={`${r.payoutDetail} · ${r.payoutMethod}`} />, <span key="a" className="font-800">{formatMoney(r.amount)}</span>, r.payoutMethod, r.requestedAt, formatMoney(r.walletBalance), r.completedSessions, <div key="x" className="flex gap-2"><button className="btn-success py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/withdrawals/${r.id}/mark-paid`, `${r.interviewerName} payout marked paid`)}><Busy id={r.id} busyId={busyId}><CheckCircle2 size={13} /></Busy>Transfer</button><button className="btn-danger py-1.5 px-2 text-xs" onClick={() => action(r.id, `/admin/withdrawals/${r.id}/reject`, `${r.interviewerName} payout rejected`)}><XCircle size={13} />Reject</button></div>])} />; }
function Revenue({ data }: { data: Overview }) { return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Kpi label="Total Payments" value={formatMoney(data.payments.reduce((s, p) => s + p.amount, 0))} icon={CreditCard} /><Kpi label="Commission" value={formatMoney(data.payments.reduce((s, p) => s + p.commission, 0))} icon={Wallet} /><Kpi label="Transactions" value={String(data.payments.length)} icon={BookOpen} /></div><Payments rows={data.payments} /></div>; }
function Security({ rows }: { rows: Audit[] }) { return <Table columns={['Time', 'Actor', 'Action', 'Target', 'Risk']} rows={rows.map((r) => [r.time, r.actor, r.action, r.target, <Badge key="r" value={r.risk} />])} />; }
function SettingsView() { return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[['Commission Rate', '20%', 'Applied to completed interview payments.'], ['Approval SLA', '24 hours', 'Older applications are flagged.'], ['Minimum Payout', '\u20B9500', 'Withdrawal threshold for interviewers.'], ['Support Escalation', 'High priority', 'Open high-priority complaints are surfaced in alerts.']].map(([title, value, body]) => <div key={title} className="bg-card border border-border rounded-xl p-5"><p className="section-label mb-2">{title}</p><p className="text-2xl font-800 text-foreground mb-2">{value}</p><p className="text-sm text-muted-foreground mb-4">{body}</p><button className="btn-secondary py-2 px-3 text-xs" onClick={() => toast.info(`${title} editor opened`)}>Edit setting</button></div>)}</div>; }

function filterData(tab: AdminTab, data: Overview | null, query: string): Overview {
  const empty: Overview = { metrics: { students: 0, interviewers: 0, bookingsThisMonth: 0, revenueThisMonth: 0, pendingApprovals: 0, pendingWithdrawals: 0 }, pendingInterviewers: [], withdrawals: [], students: [], bookings: [], technologies: [], reviews: [], complaints: [], payments: [], topInterviewers: [], audits: [] };
  const source = data || empty;
  const q = query.trim().toLowerCase();
  if (!q) return source;
  const match = (item: unknown) => JSON.stringify(item).toLowerCase().includes(q);
  return { ...source, pendingInterviewers: source.pendingInterviewers.filter(match), withdrawals: source.withdrawals.filter(match), students: source.students.filter(match), bookings: source.bookings.filter(match), technologies: source.technologies.filter(match), reviews: source.reviews.filter(match), complaints: source.complaints.filter(match), payments: source.payments.filter(match), topInterviewers: source.topInterviewers.filter(match), audits: source.audits.filter(match) };
}

function getExportRows(tab: AdminTab, data: Overview) {
  if (tab === 'students') return [['name', 'email', 'college', 'bookings', 'spend', 'status'], ...data.students.map((r) => [r.name, r.email, r.college, r.bookings, r.spend, r.status])];
  if (tab === 'bookings') return [['id', 'student', 'interviewer', 'technology', 'date', 'amount', 'status'], ...data.bookings.map((r) => [r.id, r.student, r.interviewer, r.technology, r.date, r.amount, r.status])];
  if (tab === 'withdrawals') return [['id', 'interviewer', 'amount', 'method', 'detail', 'status'], ...data.withdrawals.map((r) => [r.id, r.interviewerName, r.amount, r.payoutMethod, r.payoutDetail, r.status])];
  if (tab === 'approvals' || tab === 'interviewers') return [['id', 'name', 'email', 'company', 'designation', 'experience'], ...data.pendingInterviewers.map((r) => [r.id, r.name, r.email, r.company, r.designation, r.experience])];
  return [['section', 'records'], [tab, JSON.stringify(filterData(tab, data, ''))]];
}









