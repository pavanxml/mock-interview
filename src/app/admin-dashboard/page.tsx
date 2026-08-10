import AdminLayout from './components/AdminLayout';
import AdminSectionContent, { type AdminTab } from './components/AdminSectionContent';

interface AdminDashboardPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

const ADMIN_TABS: AdminTab[] = ['dashboard', 'interviewers', 'students', 'bookings', 'technologies', 'reviews', 'complaints', 'payments', 'withdrawals', 'revenue', 'approvals', 'security', 'settings'];

function getValidTab(tab?: string): AdminTab {
  return ADMIN_TABS.includes(tab as AdminTab) ? (tab as AdminTab) : 'dashboard';
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const params = await searchParams;
  const activeTab = getValidTab(params?.tab);

  return (
    <AdminLayout activePage={activeTab}>
      <AdminSectionContent activeTab={activeTab} />
    </AdminLayout>
  );
}
