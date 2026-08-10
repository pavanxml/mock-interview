import InterviewerLayout from './components/InterviewerLayout';
import InterviewerPortalContent, { type InterviewerTab } from './components/InterviewerPortal';

interface InterviewerPortalPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

const INTERVIEWER_TABS: InterviewerTab[] = ['dashboard', 'requests', 'accepted', 'availability', 'feedback', 'earnings', 'reviews', 'profile'];

function getValidTab(tab?: string): InterviewerTab {
  return INTERVIEWER_TABS.includes(tab as InterviewerTab) ? (tab as InterviewerTab) : 'dashboard';
}

export default async function InterviewerPortalPage({ searchParams }: InterviewerPortalPageProps) {
  const params = await searchParams;
  const activeTab = getValidTab(params?.tab);

  return (
    <InterviewerLayout activePage={activeTab}>
      <InterviewerPortalContent initialActiveTab={activeTab} />
    </InterviewerLayout>
  );
}
