import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    metrics: {
      totalBookings: 3,
      upcomingSessions: 1,
      completedSessions: 2,
      feedbackReports: 2,
    },
    upcoming: [
      {
        id: 'BK-1001',
        interviewerName: 'Arjun Mehta',
        interviewerCompany: 'Google',
        interviewerRole: 'Staff Engineer',
        technology: 'System Design',
        date: '2026-08-10',
        time: '14:00 - 15:00 IST',
        status: 'CONFIRMED',
        meetingUrl: 'https://meet.google.com/demo-session',
      },
    ],
    past: [
      {
        id: 'BK-0998',
        interviewerName: 'Priya Sharma',
        interviewerCompany: 'Amazon',
        interviewerRole: 'Senior SDE',
        technology: 'Data Structures & Algorithms',
        date: '2026-08-01',
        time: '16:00 - 17:00 IST',
        status: 'COMPLETED',
        feedbackAvailable: true,
        rating: 5,
      },
    ],
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
