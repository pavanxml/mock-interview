import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.toLowerCase() || '';
  const expertise = new Set((url.searchParams.get('expertise') || '').split(',').filter(Boolean));
  const pending = workflowStore.bookings
    .filter((booking) => booking.status === 'pending' && (!expertise.size || expertise.has(booking.technology)))
    .map((booking) => ({
      id: booking.id,
      student: booking.studentName,
      college: booking.college,
      technology: booking.technology,
      preferredDate: booking.date,
      preferredTime: booking.time,
      duration: booking.duration,
      amount: booking.amount,
      postedAt: 'Just now',
      resumeUrl: '#',
    }));
  const interviews = workflowStore.bookings
    .filter((booking) => ['accepted', 'confirmed', 'completed'].includes(booking.status) && (!email || booking.interviewerEmail === email || booking.id === 'BK-1001'))
    .map((booking) => ({
      id: booking.id,
      bookingId: booking.id,
      studentName: booking.studentName,
      technology: booking.technology,
      startsAt: `${booking.date} ${booking.time}`,
      duration: booking.duration,
      meetingUrl: booking.meetingUrl,
      status: booking.status,
    }));
  const data = {
    metrics: {
      totalEarnings: 14500,
      completedInterviews: 29,
      pendingRequests: pending.length,
      averageRating: 4.9,
    },
    requests: pending,
    interviews,
  };

  return NextResponse.json({
    success: true,
    data,
  });
}
