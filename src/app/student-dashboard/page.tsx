import StudentLayout from './components/StudentLayout';
import StudentDashboardContent, { type StudentTab } from './components/StudentDashboard';

interface StudentDashboardPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

const STUDENT_TABS: StudentTab[] = ['overview', 'upcoming', 'history', 'feedback', 'payments', 'reviews', 'profile'];

function getValidTab(tab?: string): StudentTab {
  if (tab === 'dashboard') return 'overview';
  return STUDENT_TABS.includes(tab as StudentTab) ? (tab as StudentTab) : 'overview';
}

export default async function StudentDashboardPage({ searchParams }: StudentDashboardPageProps) {
  const params = await searchParams;
  const activeTab = getValidTab(params?.tab);

  return (
    <StudentLayout activePage={activeTab === 'overview' ? 'dashboard' : activeTab}>
      <StudentDashboardContent initialActiveTab={activeTab} />
    </StudentLayout>
  );
}
