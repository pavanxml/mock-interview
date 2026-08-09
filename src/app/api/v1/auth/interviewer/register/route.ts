import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, currentCompany, currentDesignation, expertise } = body;

    const authResult = {
      userId: 'int_' + Math.random().toString(36).substring(2, 9),
      email: email || 'interviewer@example.com',
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
