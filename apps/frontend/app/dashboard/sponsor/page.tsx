import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getMyCampaigns } from '@/lib/server-api';
import { CampaignList } from './components/campaign-list';
import { CreateCampaignButton } from './components/create-campaign-button';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Campaigns</h1>
        <CreateCampaignButton />
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  );
}
