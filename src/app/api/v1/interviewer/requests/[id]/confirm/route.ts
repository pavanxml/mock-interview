import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const booking = workflowStore.bookings.find((item) => item.id === id);
  const meetingUrl = String(body.meetingUrl || '').trim();
  if (!booking || booking.status !== 'accepted') return NextResponse.json({ success: false, message: 'Accept the booking before confirming it.' }, { status: 404 });
  if (!/^https:\/\/(meet\.google\.com|zoom\.us|teams\.microsoft\.com)\//i.test(meetingUrl)) return NextResponse.json({ success: false, message: 'Enter a valid Google Meet, Zoom, or Teams link.' }, { status: 400 });
  booking.status = 'confirmed';
  booking.meetingUrl = meetingUrl;
  booking.message = String(body.message || '');
  return NextResponse.json({ success: true, data: booking });
}

