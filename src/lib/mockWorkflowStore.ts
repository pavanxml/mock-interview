export type MockApplication = {
  id: string;
  email: string;
  fullName: string;
  currentCompany: string;
  currentDesignation: string;
  expertise: string[];
  password: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type MockBooking = {
  id: string;
  studentEmail: string;
  studentName: string;
  college: string;
  technology: string;
  interviewerName: string;
  interviewerEmail: string;
  interviewerCompany: string;
  interviewerRole: string;
  date: string;
  time: string;
  duration: string;
  meetingUrl: string;
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'declined';
  amount: number;
  message?: string;
};

type MockWorkflowStore = {
  applications: MockApplication[];
  bookings: MockBooking[];
};

const globalStore = globalThis as typeof globalThis & { __interviewHubWorkflowStore?: MockWorkflowStore };

export const workflowStore = globalStore.__interviewHubWorkflowStore ?? (globalStore.__interviewHubWorkflowStore = {
  applications: [],
  bookings: [
    {
      id: 'BK-1001',
      studentEmail: 'test@example.com',
      studentName: 'Pavan Raghava',
      college: 'QIS College of Engineering',
      technology: 'System Design',
      interviewerName: 'Arjun Mehta',
      interviewerEmail: 'interviewer@example.com',
      interviewerCompany: 'Google',
      interviewerRole: 'Staff Engineer',
      date: '2026-08-10',
      time: '14:00 IST',
      duration: '41-50 min',
      meetingUrl: 'https://meet.google.com/demo-session',
      status: 'confirmed',
      amount: 500,
    },
  ],
});

