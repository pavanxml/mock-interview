import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

interface BookingRequest {
  bookingId?: string;
  studentName?: string;
  studentEmail?: string;
  college?: string;
  technology?: string;
  duration?: string;
  durationMinutes?: number;
  date?: string;
  time?: string;
  amount?: number;
  resumeUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingRequest;
    const bookingId = body.bookingId?.trim() || `IH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const date = body.date?.trim() || 'TBD';
    const time = body.time?.trim() || 'TBD';
    const duration = body.duration?.trim() || `${body.durationMinutes || 0} min`;
    const amount = Number(body.amount || 0);

    const booking = {
      id: bookingId,
      studentEmail: body.studentEmail || '',
      studentName: body.studentName || 'Student',
      college: body.college || 'Student profile',
      technology: body.technology || 'Mock Interview',
      interviewerName: 'Pending interviewer',
      interviewerEmail: '',
      interviewerCompany: 'InterviewHub',
      interviewerRole: 'Awaiting acceptance',
      date,
      time,
      duration,
      meetingUrl: '',
      status: 'pending',
      amount: Number.isFinite(amount) ? amount : 0,
    };
    workflowStore.bookings.push(booking);

    return NextResponse.json(
      { success: true, data: booking, message: 'Booking request sent to interviewers.' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to create booking request' },
      { status: 400 },
    );
  }
}
