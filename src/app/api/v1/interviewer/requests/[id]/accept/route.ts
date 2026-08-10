import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const booking = workflowStore.bookings.find((item) => item.id === id);
  if (!booking || booking.status !== 'pending') return NextResponse.json({ success: false, message: 'Booking request is no longer available.' }, { status: 404 });
  booking.status = 'accepted';
  booking.interviewerEmail = String(body.interviewerEmail || 'interviewer@example.com').toLowerCase();
  booking.interviewerName = body.interviewerName || 'Interviewer';
  booking.interviewerCompany = body.company || 'InterviewHub';
  booking.interviewerRole = body.designation || 'Interviewer';
  return NextResponse.json({ success: true, data: booking });
}

