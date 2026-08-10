import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const application = workflowStore.applications.find((item) => item.id === id);
  if (!application) return NextResponse.json({ success: false, message: 'Interviewer application not found.' }, { status: 404 });
  application.status = 'approved';
  return NextResponse.json({ success: true, data: application, message: 'Interviewer approved.' });
}

