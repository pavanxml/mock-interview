import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email')?.toLowerCase() || '';
  const liveBookings = workflowStore.bookings
    .filter((booking) => !email || booking.studentEmail.toLowerCase() === email)
    .map((booking) => ({
      id: booking.id,
      interviewerName: booking.interviewerName,
      interviewerCompany: booking.interviewerCompany,
      interviewerRole: booking.interviewerRole,
      technology: booking.technology,
      date: booking.date,
      time: booking.time,
      status: booking.status.toUpperCase(),
      meetingUrl: booking.meetingUrl,
      amount: booking.amount,
    }));
  const data = {
    metrics: {
      totalBookings: 3,
      upcomingSessions: 1,
      completedSessions: 2,
      feedbackReports: 2,
    },
    upcoming: liveBookings.length > 0 ? liveBookings : [
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
    past: liveBookings.length > 0 ? [] : [
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
