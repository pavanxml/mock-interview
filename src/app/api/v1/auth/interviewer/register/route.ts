import { NextResponse } from 'next/server';
import { workflowStore } from '@/lib/mockWorkflowStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, currentCompany, currentDesignation, expertise } = body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const existing = workflowStore.applications.find((application) => application.email === normalizedEmail);
    const application = {
      id: existing?.id || `APP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      email: normalizedEmail,
      fullName: fullName || 'Interviewer User',
      currentCompany: currentCompany || 'Tech Corp',
      currentDesignation: currentDesignation || 'Senior Engineer',
      expertise: Array.isArray(expertise) ? expertise : ['System Design', 'React'],
      password: String(body.password || ''),
      status: existing?.status || 'pending',
    } as const;
    if (!existing) workflowStore.applications.push(application);

    const authResult = {
      userId: application.id,
          email: normalizedEmail || 'interviewer@example.com',
      role: 'INTERVIEWER_PENDING',
      accessToken: 'demo-access-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
      fullName: fullName || 'Interviewer User',
      designation: currentDesignation || 'Senior Engineer',
      company: currentCompany || 'Tech Corp',
      expertise: expertise || ['System Design', 'React'],
      phone: '',
      graduationYear: '',
    };

    return NextResponse.json(
      {
        success: true,
        data: authResult,
        message: 'Interviewer application submitted for admin review.',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
