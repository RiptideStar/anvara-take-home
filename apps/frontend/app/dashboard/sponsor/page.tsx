import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getMyCampaigns } from '@/lib/server-api';
import { StatCards } from '@/app/components/stat-cards';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignButton } from './components/create-campaign-button';

function money(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;
}

export default async function SponsorDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'sponsor' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'sponsor') {
    redirect('/');
  }

  // Fetch campaigns on the server, forwarding the session cookie. The backend
  // scopes results to this sponsor. Any failure propagates to error.tsx.
  const campaigns = await getMyCampaigns();

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);
  const activeCount = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const stats = [
    { label: 'Campaigns', value: String(campaigns.length) },
    { label: 'Active', value: String(activeCount) },
    { label: 'Total budget', value: money(totalBudget) },
    { label: 'Spent', value: money(totalSpent) },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <p className="eyebrow mb-3">Sponsor dashboard</p>
          <h1 className="text-3xl sm:text-4xl">My Campaigns</h1>
        </div>
        <CreateCampaignButton />
      </header>

      {campaigns.length > 0 && <StatCards stats={stats} />}

      <CampaignList campaigns={campaigns} />
    </div>
  );
}
