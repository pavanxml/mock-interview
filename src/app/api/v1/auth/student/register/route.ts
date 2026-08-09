import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, college, graduationYear } = body;

    const authResult = {
      userId: 'std_' + Math.random().toString(36).substring(2, 9),
      email: email || 'student@example.com',
      role: 'STUDENT',
      accessToken: 'demo-access-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresInSeconds: 3600,
      fullName: fullName || 'Student User',
      designation: 'Student',
      company: college || 'University',
      expertise: [],
      phone: phone || '',
      graduationYear: graduationYear || '2025',
    };

    return NextResponse.json(
      {
        success: true,
        data: authResult,
        message: 'Student registered successfully. You can sign in now.',
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
