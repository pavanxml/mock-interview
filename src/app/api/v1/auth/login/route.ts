import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body;
    const userEmail = email ? email.toLowerCase() : 'user@example.com';
    const userRole = (role || 'STUDENT').toUpperCase();

    let authResult;
    if (userRole === 'INTERVIEWER') {
      authResult = {
        userId: 'int_101',
        email: userEmail,
        role: 'INTERVIEWER',
        accessToken: 'demo-access-token-' + Date.now(),
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        fullName: 'Arjun Mehta',
        designation: 'Staff Engineer',
        company: 'Google',
        expertise: ['System Design', 'Java', 'Distributed Systems'],
        phone: '9876543210',
        graduationYear: '2018',
      };
    } else if (userRole === 'ADMIN') {
      authResult = {
        userId: 'admin_1',
        email: userEmail,
        role: 'ADMIN',
        accessToken: 'demo-access-token-' + Date.now(),
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        fullName: 'Admin User',
        designation: 'Administrator',
        company: 'MockInterview',
        expertise: [],
        phone: '',
        graduationYear: '',
      };
    } else {
      authResult = {
        userId: 'std_101',
        email: userEmail,
        role: 'STUDENT',
        accessToken: 'demo-access-token-' + Date.now(),
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        fullName: 'Pavan Raghava',
        designation: 'Student',
        company: 'QIS College of Engineering',
        expertise: [],
        phone: '6300181054',
        graduationYear: '2025',
      };
    }

    return NextResponse.json({
      success: true,
      data: authResult,
      message: 'Login successful',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Login failed' },
      { status: 400 }
    );
  }
}
