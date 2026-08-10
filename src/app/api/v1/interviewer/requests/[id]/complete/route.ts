import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const booking = workflowStore.bookings.find((item) => item.id === id);
  if (!booking || booking.status !== 'confirmed') return NextResponse.json({ success: false, message: 'Only confirmed interviews can be completed.' }, { status: 404 });
  booking.status = 'completed';
  return NextResponse.json({ success: true, data: booking });
}

