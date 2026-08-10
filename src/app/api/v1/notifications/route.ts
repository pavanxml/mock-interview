import { NextResponse } from 'next/server';

export async function GET() {
  const notifications = [
    {
      id: 'notif_1',
      title: 'Interview Confirmed',
      message: 'Your System Design mock interview with Arjun Mehta is confirmed for Aug 10 at 2:00 PM.',
      timestamp: '1 hour ago',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Welcome to InterviewHub!',
      message: 'Explore 2,400+ verified interviewers and book your first session.',
      timestamp: '1 day ago',
      read: true,
    },
  ];

  return NextResponse.json({
    success: true,
    data: notifications,
  });
}
