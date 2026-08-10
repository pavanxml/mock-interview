import { NextResponse } from 'next/server';

export async function GET() {
  const overview = {
    metrics: {
      students: 18450,
      interviewers: 2420,
      bookingsThisMonth: 1260,
      revenueThisMonth: 630000,
      pendingApprovals: 14,
      pendingWithdrawals: 8,
    },
    pendingInterviewers: [
      {
        id: 'int_p1',
        name: 'Siddharth Rao',
        email: 'siddharth@example.com',
        company: 'Microsoft',
        designation: 'Senior Software Engineer',
        experience: '6 YOE',
        linkedinUrl: 'https://linkedin.com/in/demo',
        expertise: ['System Design', 'C++', 'Azure'],
        linkedinVerified: true,
        resumeUploaded: true,
        idCardUploaded: true,
        submittedAt: '2026-08-09T10:00:00Z',
        waitHours: 6,
      },
    ],
    withdrawals: [
      {
        id: 'w_101',
        interviewerName: 'Priya Sharma',
        amount: 4500,
        payoutMethod: 'UPI',
        payoutDetail: 'priya@upi',
        requestedAt: '2026-08-08T14:30:00Z',
        walletBalance: 9000,
        completedSessions: 12,
        status: 'PENDING',
      },
    ],
    students: [
      { name: 'Pavan Raghava', email: 'pavan@example.com', college: 'QIS College', bookings: 3, spend: 1500, status: 'Active' },
      { name: 'Rahul Verma', email: 'rahul@example.com', college: 'IIT Madras', bookings: 5, spend: 2500, status: 'Active' },
    ],
    bookings: [
      { id: 'BK-1001', student: 'Pavan Raghava', interviewer: 'Arjun Mehta', technology: 'System Design', date: '2026-08-10 14:00', amount: 500, status: 'CONFIRMED' },
    ],
    technologies: [
      { name: 'System Design', bookings: 450, interviewers: 120, revenue: 225000, demand: 'High' },
      { name: 'React / Next.js', bookings: 380, interviewers: 95, revenue: 190000, demand: 'High' },
    ],
    reviews: [
      { id: 'rev_1', student: 'Pavan Raghava', interviewer: 'Arjun Mehta', rating: 5, text: 'Great mock interview! Got actionable feedback on system design.', status: 'PUBLISHED' },
    ],
    complaints: [
      { id: 'c_1', code: 'CMP-101', reportedBy: 'Rahul Verma', issue: 'Interviewer joined 10 mins late', priority: 'Medium', status: 'OPEN', age: '2h ago' },
    ],
    payments: [
      { id: 'PAY-8901', user: 'Pavan Raghava', item: 'System Design Mock Interview', amount: 500, commission: 100, status: 'SUCCESS' },
    ],
    topInterviewers: [
      { name: 'Arjun Mehta', company: 'Google', designation: 'Staff Engineer', technologies: ['System Design', 'Java'], rating: 4.9, sessions: 142, earnings: 71000, badge: 'Top Rated' },
    ],
    audits: [
      { time: '10 mins ago', actor: 'Admin', action: 'Approved interviewer', target: 'siddharth@example.com', risk: 'Low' },
    ],
  };

  return NextResponse.json({
    success: true,
    data: overview,
  });
}
