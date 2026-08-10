import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    metrics: {
      totalEarnings: 14500,
      completedInterviews: 29,
      pendingRequests: 2,
      averageRating: 4.9,
    },
    pendingRequests: [
      {
        id: 'REQ-201',
        studentName: 'Pavan Raghava',
        college: 'QIS College of Engineering',
        technology: 'System Design',
        requestedDate: '2026-08-11',
        requestedTime: '15:00 IST',
        amount: 500,
      },
    ],
    upcomingSessions: [
      {
        id: 'BK-1001',
        studentName: 'Pavan Raghava',
        technology: 'System Design',
        date: '2026-08-10',
        time: '14:00 IST',
        meetingUrl: 'https://meet.google.com/demo-session',
      },
    ],
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
